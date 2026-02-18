import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import {
  notifyTokensPurchased,
  notifyPaymentSuccessful,
  notifyPaymentFailed
} from '../services/notificationService.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Token packages matching frontend
const TOKEN_PACKAGES = {
  starter: { tokens: 10, price: 9.99, bonus: 0, name: 'Starter Pack' },
  popular: { tokens: 25, price: 19.99, bonus: 5, name: 'Popular Pack' },
  professional: { tokens: 50, price: 34.99, bonus: 10, name: 'Professional' },
  premium: { tokens: 100, price: 59.99, bonus: 25, name: 'Premium Pack' }
};

// @desc    Create payment intent
// @route   POST /api/payments/intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
  try {
    const { packageType } = req.body;

    if (!packageType || !TOKEN_PACKAGES[packageType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package type. Choose: starter, popular, professional, or premium'
      });
    }

    const package_details = TOKEN_PACKAGES[packageType];
    const totalTokens = package_details.tokens + package_details.bonus; // Base tokens + bonus
    const amount = Math.round(package_details.price * 100); // Convert to cents

    // Create or get Stripe customer
    let customer;
    const user = await User.findById(req.user._id);

    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });

      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      metadata: {
        userId: user._id.toString(),
        packageType,
        tokensAmount: totalTokens,
        baseTokens: package_details.tokens,
        bonusTokens: package_details.bonus
      },
      description: `${package_details.name} - ${totalTokens} tokens (${package_details.tokens} + ${package_details.bonus} bonus)`
    });

    // Create payment record
    const payment = await Payment.create({
      user: user._id,
      amount: package_details.price,
      currency: 'USD',
      tokensAmount: totalTokens,
      packageType,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customer.id,
      status: 'pending',
      metadata: {
        baseTokens: package_details.tokens,
        bonusTokens: package_details.bonus,
        packageName: package_details.name
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      payment: {
        id: payment._id,
        amount: payment.amount,
        tokensAmount: payment.tokensAmount,
        packageType: payment.packageType
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// @desc    Confirm payment and add tokens
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Check if already processed
    if (payment.status === 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed'
      });
    }

    // Update payment status
    payment.status = 'succeeded';
    payment.stripePaymentMethodId = paymentIntent.payment_method;
    await payment.save();

    // Add tokens to user
    const user = await User.findById(payment.user);
    const previousBalance = user.tokens;
    await user.addTokens(payment.tokensAmount, 'purchase');

    // Create transaction record
    const transaction = await Transaction.create({
      user: user._id,
      type: 'credit',
      amount: payment.tokensAmount,
      reason: 'purchase',
      description: `Purchased ${payment.packageType} package`,
      payment: payment._id,
      balanceBefore: previousBalance,
      balanceAfter: user.tokens
    });

    // Send notifications
    const io = req.app.get('io');
    await notifyTokensPurchased(user._id, payment.tokensAmount, transaction._id, io);
    await notifyPaymentSuccessful(user._id, payment.amount, transaction._id, io);

    res.status(200).json({
      success: true,
      message: 'Payment successful! Tokens have been added to your account.',
      payment: {
        id: payment._id,
        amount: payment.amount,
        tokensAmount: payment.tokensAmount,
        packageType: payment.packageType,
        receiptNumber: payment.receiptNumber
      },
      newBalance: user.tokens
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
export const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent ${paymentIntent.id} succeeded!`);

      // Update payment record
      const payment = await Payment.findOne({
        stripePaymentIntentId: paymentIntent.id
      });

      if (payment && payment.status === 'pending') {
        payment.status = 'succeeded';
        await payment.save();

        // Add tokens to user
        const user = await User.findById(payment.user);
        const previousBalance = user.tokens;
        await user.addTokens(payment.tokensAmount, 'purchase');

        // Create transaction
        const transaction = await Transaction.create({
          user: user._id,
          type: 'credit',
          amount: payment.tokensAmount,
          reason: 'purchase',
          description: `Purchased ${payment.packageType} package (webhook)`,
          payment: payment._id,
          balanceBefore: previousBalance,
          balanceAfter: user.tokens
        });

        // Send notifications (webhook has no req.app, so io will be null)
        await notifyTokensPurchased(user._id, payment.tokensAmount, transaction._id, null);
        await notifyPaymentSuccessful(user._id, payment.amount, transaction._id, null);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`PaymentIntent ${failedPayment.id} failed!`);

      // Update payment record
      const failedPaymentRecord = await Payment.findOne({
        stripePaymentIntentId: failedPayment.id
      });

      if (failedPaymentRecord) {
        failedPaymentRecord.status = 'failed';
        failedPaymentRecord.failureReason = failedPayment.last_payment_error?.message;
        await failedPaymentRecord.save();

        // Notify user about payment failure
        const failureReason = failedPayment.last_payment_error?.message || 'Payment was declined';
        await notifyPaymentFailed(failedPaymentRecord.user, failedPaymentRecord.amount, failureReason, null);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const totalSpent = payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalTokensPurchased = payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.tokensAmount, 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalSpent,
      totalTokensPurchased,
      payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
};

// @desc    Get single payment by ID
// @route   GET /api/payments/:paymentId
// @access  Private
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify user owns this payment
    if (payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

// @desc    Get token packages
// @route   GET /api/payments/packages
// @access  Public
export const getTokenPackages = (req, res) => {
  res.status(200).json({
    success: true,
    packages: [
      {
        id: 'starter',
        type: 'starter',
        name: TOKEN_PACKAGES.starter.name,
        tokens: TOKEN_PACKAGES.starter.tokens,
        bonus: TOKEN_PACKAGES.starter.bonus,
        totalTokens: TOKEN_PACKAGES.starter.tokens + TOKEN_PACKAGES.starter.bonus,
        price: TOKEN_PACKAGES.starter.price,
        pricePerToken: (TOKEN_PACKAGES.starter.price / (TOKEN_PACKAGES.starter.tokens + TOKEN_PACKAGES.starter.bonus)).toFixed(2),
        popular: false
      },
      {
        id: 'popular',
        type: 'popular',
        name: TOKEN_PACKAGES.popular.name,
        tokens: TOKEN_PACKAGES.popular.tokens,
        bonus: TOKEN_PACKAGES.popular.bonus,
        totalTokens: TOKEN_PACKAGES.popular.tokens + TOKEN_PACKAGES.popular.bonus,
        price: TOKEN_PACKAGES.popular.price,
        pricePerToken: (TOKEN_PACKAGES.popular.price / (TOKEN_PACKAGES.popular.tokens + TOKEN_PACKAGES.popular.bonus)).toFixed(2),
        popular: true
      },
      {
        id: 'professional',
        type: 'professional',
        name: TOKEN_PACKAGES.professional.name,
        tokens: TOKEN_PACKAGES.professional.tokens,
        bonus: TOKEN_PACKAGES.professional.bonus,
        totalTokens: TOKEN_PACKAGES.professional.tokens + TOKEN_PACKAGES.professional.bonus,
        price: TOKEN_PACKAGES.professional.price,
        pricePerToken: (TOKEN_PACKAGES.professional.price / (TOKEN_PACKAGES.professional.tokens + TOKEN_PACKAGES.professional.bonus)).toFixed(2),
        popular: false
      },
      {
        id: 'premium',
        type: 'premium',
        name: TOKEN_PACKAGES.premium.name,
        tokens: TOKEN_PACKAGES.premium.tokens,
        bonus: TOKEN_PACKAGES.premium.bonus,
        totalTokens: TOKEN_PACKAGES.premium.tokens + TOKEN_PACKAGES.premium.bonus,
        price: TOKEN_PACKAGES.premium.price,
        pricePerToken: (TOKEN_PACKAGES.premium.price / (TOKEN_PACKAGES.premium.tokens + TOKEN_PACKAGES.premium.bonus)).toFixed(2),
        popular: false
      }
    ]
  });
};

// @desc    Process alternative payment (PayPal, InstaPay, Fawry, Wallet)
// @route   POST /api/payments/process
// @access  Private
export const processAlternativePayment = async (req, res) => {
  try {
    const { packageType, paymentMethod, paymentDetails } = req.body;

    if (!packageType || !TOKEN_PACKAGES[packageType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package type'
      });
    }

    if (!paymentMethod || !['paypal', 'visa', 'instapay', 'fawry', 'wallet'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    const package_details = TOKEN_PACKAGES[packageType];
    const totalTokens = package_details.tokens + package_details.bonus;

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      amount: package_details.price,
      currency: 'USD',
      tokensAmount: totalTokens,
      packageType,
      paymentMethod,
      status: 'processing',
      metadata: {
        baseTokens: package_details.tokens,
        bonusTokens: package_details.bonus,
        packageName: package_details.name,
        paymentDetails: paymentDetails || {}
      }
    });

    // Simulate payment processing (in production, integrate with actual payment gateways)
    // For development, we'll auto-approve after a short delay
    setTimeout(async () => {
      try {
        payment.status = 'succeeded';
        await payment.save();

        // Add tokens to user
        const user = await User.findById(payment.user);
        const previousBalance = user.tokens;
        await user.addTokens(totalTokens, 'purchase');

        // Create transaction record
        const transaction = await Transaction.create({
          user: user._id,
          type: 'credit',
          amount: totalTokens,
          reason: 'purchase',
          description: `Purchased ${package_details.name} via ${paymentMethod}`,
          payment: payment._id,
          balanceBefore: previousBalance,
          balanceAfter: user.tokens
        });

        // Send notifications (no io available in setTimeout, so pass null)
        await notifyTokensPurchased(user._id, totalTokens, transaction._id, null);
        await notifyPaymentSuccessful(user._id, package_details.price, transaction._id, null);
      } catch (error) {
        console.error('Payment processing error:', error);
      }
    }, 2000); // 2 second delay to simulate processing

    res.status(200).json({
      success: true,
      message: `Payment processing via ${paymentMethod}. Tokens will be added shortly.`,
      payment: {
        id: payment._id,
        amount: payment.amount,
        tokensAmount: payment.tokensAmount,
        packageType: payment.packageType,
        paymentMethod: payment.paymentMethod,
        receiptNumber: payment.receiptNumber
      }
    });
  } catch (error) {
    console.error('Alternative payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

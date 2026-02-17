import nodemailer from 'nodemailer';
import { activationEmailTemplate, otpEmailTemplate, welcomeEmailTemplate, banEmailTemplate } from '../utils/emailTemplates.js';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send activation email
export const sendActivationEmail = async (email, name, activationToken) => {
  try {
    const transporter = createTransporter();

    const activationLink = `${process.env.FRONTEND_URL}/activate?token=${activationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SkillSwap <noreply@skillswap.com>',
      to: email,
      subject: 'Activate Your SkillSwap Account',
      html: activationEmailTemplate(name, activationLink)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Activation email sent to ${email}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending activation email:', error);
    throw new Error('Failed to send activation email');
  }
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    console.log('📧 Creating transporter for OTP email...');
    const transporter = createTransporter();

    console.log('📧 Verifying transporter connection...');
    await transporter.verify();
    console.log('📧 Transporter verified successfully');

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SkillSwap <noreply@skillswap.com>',
      to: email,
      subject: 'Your SkillSwap Login OTP',
      html: otpEmailTemplate(otp)
    };

    console.log('📧 Sending OTP email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error command:', error.command);
    console.error('❌ Full error stack:', error.stack);
    throw new Error('Failed to send OTP email');
  }
};

// Send welcome email after activation
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SkillSwap <noreply@skillswap.com>',
      to: email,
      subject: 'Welcome to SkillSwap!',
      html: welcomeEmailTemplate(name)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
    return {
      success: false,
      error: error.message
    };
  }
};

// Send account ban email
export const sendBanEmail = async (email, name, reason) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SkillSwap <noreply@skillswap.com>',
      to: email,
      subject: 'Your SkillSwap Account Has Been Suspended',
      html: banEmailTemplate(name, reason)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Ban notification email sent to ${email}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Error sending ban email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

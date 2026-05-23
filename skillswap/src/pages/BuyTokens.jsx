import React, { memo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../components/context/UserContext";
import { useTokens } from "../components/context/TokenContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import {
  Coins,
  CreditCard,
  Wallet,
  DollarSign,
  CheckCircle,
  Star,
  Zap,
  TrendingUp,
  Shield,
  Gift,
  ArrowRight,
  X,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Store,
  ChevronLeft,
  Loader2,
  FileCheck,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { paymentAPI } from "../services/api";

// ==================== DESIGN SYSTEM TOKENS ====================
const TOKEN_PACKAGES = [
  {
    id: "starter",
    name: "Starter Node",
    tokens: 10,
    price: 9.99,
    popular: false,
    bonus: 0,
    color: "bg-blue-500",
    icon: Coins,
    features: ["Entry-level Access", "Priority Sessions", "No Expiration"],
  },
  {
    id: "popular",
    name: "Standard Pulse",
    tokens: 25,
    price: 19.99,
    popular: true,
    bonus: 5,
    savings: "20% Flow",
    color: "bg-primary",
    icon: Star,
    features: [
      "Optimized Value",
      "Guild Verification",
      "+5 Bonus Credits",
      "Network Priority",
    ],
  },
  {
    id: "professional",
    name: "Pro Transmission",
    tokens: 50,
    price: 34.99,
    popular: false,
    bonus: 10,
    savings: "30% Flow",
    color: "bg-indigo-500",
    icon: Zap,
    features: [
      "Advanced Learning",
      "Private Channels",
      "+10 Bonus Credits",
      "Session Recording",
    ],
  },
  {
    id: "premium",
    name: "Elite Collective",
    tokens: 100,
    price: 59.99,
    popular: false,
    bonus: 25,
    savings: "40% Flow",
    color: "bg-black",
    icon: TrendingUp,
    features: [
      "Full Ecosystem Access",
      "Elite Badge Access",
      "+25 Bonus Credits",
      "Concierge Support",
    ],
  },
];

const PAYMENT_METHODS = [
  {
    id: "visa",
    name: "Alpha Cards",
    icon: CreditCard,
    desc: "Visa, Mastercard, Amex",
    region: "Global",
  },
  {
    id: "paypal",
    name: "Secure Logic",
    icon: ShieldCheck,
    desc: "Fast PayPal Checkout",
    region: "Global",
  },
  {
    id: "instapay",
    name: "Pulse Pay",
    icon: Smartphone,
    desc: "Instant Bank Transfer",
    region: "Egypt",
  },
  {
    id: "wallet",
    name: "Mobile Vault",
    icon: Wallet,
    desc: "Vodafone, Orange, Etisalat",
    region: "Egypt",
  },
  {
    id: "fawry",
    name: "Fawry Hub",
    icon: Store,
    desc: "Retail Network Payment",
    region: "Egypt",
  },
];

// ==================== PREMIUM PAYMENT PROCESSOR ====================
const PaymentProcessor = memo(({ isOpen, onClose, pkg, onComplete }) => {
  const [step, setStep] = useState(1); // 1: Method, 2: Info, 3: Processing, 4: Success
  const [method, setMethod] = useState(null);
  const [formData, setFormData] = useState({
    card: "",
    holder: "",
    expiry: "",
    cvv: "",
    phone: "",
  });
  const [paymentError, setPaymentError] = useState(null);
  const [earnedTokens, setEarnedTokens] = useState(0);

  const handleNext = async () => {
    if (step === 1 && !method)
      return toast.error("Select a transmission channel");
    if (step === 1) setStep(2);
    else if (step === 2) {
      setStep(3);
      setPaymentError(null);
      try {
        const result = await paymentAPI.process(pkg.id, method, formData);
        setEarnedTokens(result.payment?.tokensAmount || pkg.tokens + pkg.bonus);
        setStep(4);
      } catch (err) {
        const msg =
          err.response?.data?.message || "Payment failed. Please try again.";
        setPaymentError(msg);
        setStep(2);
        toast.error(msg);
      }
    }
  };

  const finalize = () => {
    onComplete({
      method,
      tokens: earnedTokens,
      amount: pkg.price,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-text-main/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden border border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-bg-alt rounded-2xl text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase text-text-main">
                Authorize Flow
              </h2>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Secure Alpha Transmission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 transition-colors bg-bg-alt rounded-xl text-text-muted hover:text-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between p-6 border bg-primary/5 rounded-3xl border-primary/10">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                      Target Package
                    </p>
                    <h3 className="text-2xl font-black tracking-tighter text-text-main">
                      {pkg.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                      Flow Amount
                    </p>
                    <p className="text-2xl font-black text-primary">
                      ${pkg.price}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                  Select Transmission Protocol
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex items-center p-4 rounded-2xl border-2 transition-all group text-left ${
                        method === m.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all ${
                          method === m.id
                            ? "bg-primary text-white scale-110 shadow-lg"
                            : "bg-bg-alt text-text-muted"
                        }`}
                      >
                        <m.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black tracking-widest uppercase text-text-main">
                            {m.name}
                          </p>
                          <span className="text-[8px] font-black text-text-muted uppercase bg-white border border-border px-2 py-0.5 rounded-full">
                            {m.region}
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-text-muted lowercase">
                          {m.desc}
                        </p>
                      </div>
                      {method === m.id && (
                        <div className="flex items-center justify-center w-5 h-5 ml-4 rounded-full bg-primary">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-widest transition-colors mb-4"
                >
                  <ChevronLeft className="w-4 h-4" /> Go Back
                </button>

                {["visa", "paypal"].includes(method) ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 mb-2 block">
                        Alpha Number
                      </label>
                      <input
                        type="text"
                        placeholder="••••  ••••  ••••  ••••"
                        className="w-full p-4 text-sm font-black tracking-widest transition-all border outline-none bg-bg-alt border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 mb-2 block">
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full p-4 text-sm font-black transition-all border outline-none bg-bg-alt border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 mb-2 block">
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          className="w-full p-4 text-sm font-black transition-all border outline-none bg-bg-alt border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 mb-4 border bg-accent/5 border-accent/20 rounded-3xl">
                      <p className="mb-2 text-xs font-bold text-accent">
                        Carrier Network Validation
                      </p>
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        Please provide the phone number associated with your
                        mobile wallet or InstaPay ID.
                      </p>
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 mb-2 block">
                        Protocol Identity
                      </label>
                      <input
                        type="tel"
                        placeholder="+20  _ _  _ _ _  _ _ _ _"
                        className="w-full p-4 text-sm font-black tracking-widest transition-all border outline-none bg-bg-alt border-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 border bg-emerald-50 rounded-2xl border-emerald-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    Quantum Encryption Enabled
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 rounded-full border-primary/10" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-4 rounded-full border-t-primary"
                  />
                </div>
                <h3 className="mb-2 text-2xl font-black tracking-tight tracking-widest uppercase text-text-main">
                  Validating Transmission
                </h3>
                <p className="text-sm font-medium text-text-muted">
                  Communicating with banking node...
                </p>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <div className="flex items-center justify-center w-20 h-20 mb-8 text-white rounded-full shadow-2xl bg-emerald-500 shadow-emerald-500/30">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="mb-3 text-3xl font-black tracking-tighter text-text-main">
                  Transmission Successful
                </h3>
                <p className="mb-10 text-sm italic font-medium text-text-muted">
                  "The collective has received your flow. Credits initialized."
                </p>

                <div className="w-full p-6 bg-bg-alt rounded-[32px] border border-border mb-8 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                      Receipt Node
                    </p>
                    <p className="text-xs font-black uppercase truncate text-text-main">
                      SWP-
                      {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                      Credits Added
                    </p>
                    <p className="text-xs font-black uppercase text-emerald-500">
                      +{earnedTokens} TK
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border bg-bg-alt/50">
          {step < 3 && (
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main"
              >
                Decline
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-8 py-4 bg-text-main text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-text-main/10 hover:bg-primary transition-all flex items-center justify-center gap-3"
              >
                {step === 1 ? "Initiate Flow" : "Confirm Transmission"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {step === 4 && (
            <button
              onClick={finalize}
              className="w-full px-8 py-4 bg-text-main text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-text-main/10 hover:bg-primary transition-all"
            >
              Return to Hub
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
});

// ==================== MAIN PAGE COMPONENT ====================
const BuyTokens = memo(() => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { tokens, refreshTokens } = useTokens();
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const triggerPayment = (pkg) => {
    setSelectedPkg(pkg);
    setIsModalOpen(true);
  };

  const handleComplete = async (data) => {
    await refreshTokens();
    toast.success(`+${data.tokens} tokens added to your account!`);
    navigate("/wallet");
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-alt">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* PREMIUM HERO */}
        <section className="relative px-6 pt-40 pb-24 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[100%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[80%] bg-secondary/10 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10 mx-auto text-center max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-3 px-6 py-2.5 bg-white border border-border shadow-xl rounded-full mb-10">
                <div className="flex items-center justify-center w-6 h-6 text-white rounded-full bg-primary shrink-0">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-main">
                  The Vault Network
                </span>
              </div>

              <h1 className="text-7xl md:text-9xl font-black text-text-main tracking-tighter mb-8 leading-[0.8]">
                Synthesize
                <br />
                <span className="font-serif italic text-primary">
                  Power
                </span>{" "}
                Flow.
              </h1>

              <p className="max-w-2xl mx-auto mb-16 text-xl font-medium leading-relaxed text-text-muted">
                Initialize your learning transmission through asset acquisition.
                Acquire tokens to unlock senior mentors and elite collective
                wisdom.
              </p>

              {/* Current State Pill */}
              {user && (
                <div className="inline-flex items-center gap-4 px-8 py-5 bg-text-main shadow-2xl shadow-text-main/20 rounded-[32px] border border-white/10">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-2xl text-primary group">
                    <Coins className="w-6 h-6 transition-transform group-hover:rotate-12" />
                  </div>
                  <div className="pr-4 text-left border-r border-white/10">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">
                      Asset Registry
                    </p>
                    <p className="text-2xl font-black tracking-tight text-white">
                      {tokens}{" "}
                      <span className="text-[10px] font-bold text-white/60">
                        TK
                      </span>
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">
                      Account State
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* PACKAGE GRID */}
        <section className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {TOKEN_PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-11 rounded-[48px] border-2 transition-all group overflow-hidden ${
                  pkg.popular
                    ? "bg-white border-primary shadow-2xl scale-105 z-20"
                    : "bg-white/50 border-border hover:border-primary/30 hover:bg-white"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-6 right-6">
                    <span className="px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      Network Pick
                    </span>
                  </div>
                )}

                {/* Icon & Savings */}
                <div className="flex items-center justify-between mb-12">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all ${pkg.color}`}
                  >
                    <pkg.icon className="w-6 h-6" />
                  </div>
                  {pkg.savings && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                      {pkg.savings}
                    </span>
                  )}
                </div>

                {/* Pricing */}
                <div className="mb-10">
                  <h3 className="mb-3 text-xl font-black tracking-widest uppercase transition-colors text-text-main group-hover:text-primary">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black tracking-tighter text-text-main">
                      {pkg.tokens}
                    </p>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                      Base Nodes
                    </p>
                  </div>
                  {pkg.bonus > 0 && (
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">
                      + {pkg.bonus} Bonus Transmissions
                    </p>
                  )}
                </div>

                <div className="py-6 mb-10 border-y border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                      Cost Allocation
                    </span>
                    <span className="text-2xl font-black tracking-tighter text-text-main">
                      ${pkg.price}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="mb-12 space-y-4">
                  {pkg.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-text-main uppercase tracking-widest">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => triggerPayment(pkg)}
                  className={`w-full py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    pkg.popular
                      ? "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02]"
                      : "bg-text-main text-white hover:bg-primary shadow-xl shadow-text-main/10"
                  }`}
                >
                  Register Nodes
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* SECURITY & TRUST */}
          <div className="grid grid-cols-1 gap-8 mt-32 md:grid-cols-3">
            <div className="p-10 bg-white border border-border rounded-[48px] hover:shadow-2xl hover:shadow-primary/5 transition-all text-center group">
              <div className="w-16 h-16 bg-primary/5 rounded-[24px] flex items-center justify-center text-primary mx-auto mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="mb-3 text-lg font-black tracking-widest uppercase text-text-main">
                Quantum Security
              </h4>
              <p className="text-[11px] text-text-muted font-bold leading-relaxed uppercase tracking-wider">
                All transmissions are protected with AES-256 bank-level node
                encryption.
              </p>
            </div>
            <div className="p-10 bg-white border border-border rounded-[48px] hover:shadow-2xl hover:shadow-primary/5 transition-all text-center group">
              <div className="w-16 h-16 bg-emerald-50 rounded-[24px] flex items-center justify-center text-emerald-500 mx-auto mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="mb-3 text-lg font-black tracking-widest uppercase text-text-main">
                Instant Infusion
              </h4>
              <p className="text-[11px] text-text-muted font-bold leading-relaxed uppercase tracking-wider">
                Assets are synthesized into your wallet identity immediately
                after validation.
              </p>
            </div>
            <div className="p-10 bg-white border border-border rounded-[48px] hover:shadow-2xl hover:shadow-primary/5 transition-all text-center group">
              <div className="w-16 h-16 bg-accent/5 rounded-[24px] flex items-center justify-center text-accent mx-auto mb-8 group-hover:bg-accent group-hover:text-white transition-all">
                <FileCheck className="w-8 h-8" />
              </div>
              <h4 className="mb-3 text-lg font-black tracking-widest uppercase text-text-main">
                Alpha Registry
              </h4>
              <p className="text-[11px] text-text-muted font-bold leading-relaxed uppercase tracking-wider">
                Full transaction audit trail available in your wallet logs for
                24/7 traceability.
              </p>
            </div>
          </div>
        </section>

        {/* CTA HUB */}
        <section className="px-6 mt-32">
          <div className="max-w-7xl mx-auto p-12 lg:p-24 bg-text-main rounded-[64px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[800px] h-full bg-linear-to-bl from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center justify-between gap-12 lg:flex-row">
              <div className="max-w-xl text-center lg:text-left">
                <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">
                  Collective Growth
                </h2>
                <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                  Fuel Your{" "}
                  <span className="italic text-primary">Learning</span>{" "}
                  Transmission.
                </h3>
                <p className="mb-10 text-lg font-medium leading-relaxed text-white/60">
                  Ready to advance your nodes? Join thousands of elite learners
                  scaling their potential through pure collective exchange.
                </p>
                <div className="inline-flex items-center gap-6 p-4 border bg-white/5 border-white/10 rounded-2xl">
                  <Gift className="w-6 h-6 text-primary" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">
                    First transmission? Get a 10% bonus today.
                  </p>
                </div>
              </div>
              <div className="w-64 h-64 bg-primary/20 rounded-[64px] blur-[80px] absolute -bottom-20 -right-20 animate-pulse" />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AnimatePresence>
        {isModalOpen && (
          <PaymentProcessor
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            pkg={selectedPkg}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
});

BuyTokens.displayName = "BuyTokens";
export default BuyTokens;

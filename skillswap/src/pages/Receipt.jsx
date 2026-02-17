import { useState, useEffect, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { paymentAPI } from "../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import {
  FileText,
  Calendar,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Printer,
  Download,
  DollarSign,
  Tag,
  ShieldCheck,
  Zap,
  Globe,
  ChevronRight,
  History,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Receipt = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipt();
  }, [paymentId]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getById(paymentId);
      setPayment(response.payment);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      toast.error("Failed to load transmission logs");
      navigate("/wallet");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();
  const handleDownload = () => toast.info("PDF Generation in progress...");

  const getMethodIcon = (method) => {
    if (method?.includes('visa')) return <CreditCard className="w-5 h-5" />;
    if (method?.includes('paypal')) return <ShieldCheck className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Synchronizing Receipt...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[40px] flex items-center justify-center mb-8">
           <Info className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-text-main mb-3 tracking-tighter">Null Node Signature</h2>
        <p className="text-text-muted font-medium mb-12 italic">"We couldn't locate this transmission in the collective archive."</p>
        <Link to="/wallet" className="px-10 py-5 bg-text-main text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl">Return to Wallet</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-32 px-6">
        <div className="max-w-4xl mx-auto">
          {/* CONTROL STRIP */}
          <div className="flex items-center justify-between mb-12 print:hidden">
            <button
              onClick={() => navigate("/wallet")}
              className="group flex items-center gap-3 text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-widest transition-all"
            >
              <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                 <ArrowLeft className="w-4 h-4" />
              </div>
              Back to History
            </button>

            <div className="flex gap-4">
              <button
                onClick={handlePrint}
                className="flex items-center gap-3 px-6 py-3 bg-white border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Log
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-3 px-8 py-3 bg-text-main text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-text-main/10"
              >
                <Download className="w-4 h-4" />
                Auth Download
              </button>
            </div>
          </div>

          {/* PREMIUM RECEIPT CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-border relative"
          >
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

             {/* Header */}
             <div className="p-12 lg:p-16 bg-text-main relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.2),transparent)]" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="text-center md:text-left">
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-6">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                         <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Verified Transmission</span>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">Alpha Receipt.</h1>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Sector: SkillSwap Collective</p>
                   </div>
                   <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center text-white backdrop-blur-sm">
                      <FileText className="w-10 h-10 opacity-50" />
                   </div>
                </div>
             </div>

             {/* Content Partition */}
             <div className="p-12 lg:p-16 border-b border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   <div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Sync ID</p>
                      <p className="text-sm font-black text-text-main uppercase tracking-tight">{payment.receiptNumber}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Temporal Tag</p>
                      <p className="text-sm font-black text-text-main uppercase tracking-tight">{format(new Date(payment.createdAt), "PPP")}</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase mt-1">{format(new Date(payment.createdAt), "p")}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Channel</p>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-bg-alt rounded-xl flex items-center justify-center text-primary">
                            {getMethodIcon(payment.paymentMethod)}
                         </div>
                         <p className="text-sm font-black text-text-main uppercase tracking-tight">{payment.paymentMethod || 'Auth Credit'}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Allocation */}
             <div className="p-12 lg:p-16">
                <div className="flex items-center gap-3 mb-12">
                   <Zap className="w-5 h-5 text-primary" />
                   <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.4em]">Asset Allocation</h3>
                </div>

                <div className="bg-bg-alt p-8 rounded-[40px] border border-border mb-12">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                            <History className="w-10 h-10" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Package Node</p>
                            <h4 className="text-2xl font-black text-text-main uppercase tracking-tighter">{payment.packageType || 'Alpha Pack'}</h4>
                         </div>
                      </div>
                      <div className="text-center md:text-right">
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Synthesized Flow</p>
                         <p className="text-5xl font-black text-text-main tracking-tighter">{payment.tokensAmount} <span className="text-sm text-text-muted font-bold">TK</span></p>
                      </div>
                   </div>

                   {/* Line Items */}
                   <div className="mt-10 pt-10 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Base Transmission</span>
                         <span className="text-sm font-black text-text-main uppercase">{payment.metadata?.baseTokens || payment.tokensAmount} TK</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Collective Bonus</span>
                         <span className="text-sm font-black text-emerald-500 uppercase">+{payment.metadata?.bonusTokens || 0} TK</span>
                      </div>
                   </div>
                </div>

                {/* Final Total */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between text-text-muted">
                      <span className="text-[10px] font-black uppercase tracking-widest">Subtotal allocation</span>
                      <span className="text-sm font-black uppercase">${payment.amount.toFixed(2)}</span>
                   </div>
                   <div className="flex items-center justify-between text-text-muted pb-4 border-b border-border">
                      <span className="text-[10px] font-black uppercase tracking-widest">Protocol fee</span>
                      <span className="text-sm font-black uppercase">$0.00</span>
                   </div>
                   <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                            <DollarSign className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Value Transferred</p>
                            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Validated & Settled</p>
                         </div>
                      </div>
                      <p className="text-4xl font-black text-text-main tracking-tighter">${payment.amount.toFixed(2)} <span className="text-xs text-text-muted">USD</span></p>
                   </div>
                </div>
             </div>

             {/* Footer Info */}
             <div className="p-12 bg-bg-alt/50 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                   <ShieldCheck className="w-8 h-8 text-text-muted/30" />
                   <div className="text-left">
                      <p className="text-[10px] font-black text-text-main uppercase tracking-widest">SkillSwap Global Infra</p>
                      <p className="text-[8px] font-medium text-text-muted lowercase">Automated receipt generated by collective node system.</p>
                   </div>
                </div>
                <div className="flex gap-6">
                   <Link to="/courses" className="text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-widest transition-colors">Browse Skills</Link>
                   <Link to="/teachers" className="text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-widest transition-colors">Find Mentors</Link>
                </div>
             </div>
          </motion.div>

          <p className="text-center mt-12 text-[8px] font-black text-text-muted uppercase tracking-[0.4em] opacity-40">
             Log generated at {format(new Date(), "PPpp")} • UTC Zone Sync
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default memo(Receipt);

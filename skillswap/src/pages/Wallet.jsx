import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useTokens } from '../components/context/TokenContext';
import {
  Wallet,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  BarChart3,
  Plus,
  DollarSign,
  GraduationCap,
  ShoppingCart,
  RotateCcw,
  Gift,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  History,
  LayoutDashboard,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WalletPage = () => {
  const { tokens, refreshTokens } = useTokens();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchTransactions();
    fetchStats();
    refreshTokens();
  }, [filter, timeRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.type = filter;
      const response = await transactionsAPI.getAll(params);
      setTransactions(response.transactions || []);
    } catch (error) {
      toast.error('Failed to sync transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await transactionsAPI.getStats(timeRange);
      setStats(response.stats);
    } catch (error) { console.error(error); }
  };

  const getReasonIcon = (reason) => {
    const map = {
      purchase: <Plus className="w-5 h-5 text-emerald-500" />,
      session_teaching: <GraduationCap className="w-5 h-5 text-primary" />,
      session_learning: <ShoppingCart className="w-5 h-5 text-accent" />,
      refund: <RotateCcw className="w-5 h-5 text-indigo-500" />,
      welcome_bonus: <Gift className="w-5 h-5 text-pink-500" />,
    };
    return map[reason] || <History className="w-5 h-5 text-text-muted" />;
  };

  return (
    <div className="min-h-screen bg-bg-alt flex flex-col">
      <Navbar />
      
      <main className="flex-1 pb-32">
        {/* PREMIUM HERO */}
        <section className="relative pt-40 pb-20 px-6">
           <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[100%] bg-primary/5 blur-[120px] rounded-full" />
              <div className="absolute bottom-0 right-[-5%] w-[40%] h-[100%] bg-secondary/5 blur-[100px] rounded-full" />
           </div>

           <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row items-end justify-between gap-12">
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border shadow-sm rounded-full mb-6">
                       <BarChart3 className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Asset Management</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-text-main tracking-tighter leading-[0.8]">
                       Your Alpha<br />
                       <span className="text-primary italic font-serif">Vault</span> Ledger.
                    </h1>
                 </motion.div>

                 {/* GLOBAL BALANCE PILL */}
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-10 bg-text-main rounded-[48px] shadow-2xl shadow-text-main/20 border border-white/10 text-white min-w-[340px] relative group overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Authenticated Balance</p>
                          <div className="flex items-baseline gap-3">
                             <span className="text-6xl font-black tracking-tighter">{tokens}</span>
                             <span className="text-sm font-bold text-white/40 uppercase">Tokens</span>
                          </div>
                       </div>
                       
                       <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
                          <Link to="/buy-tokens" className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                             <Plus className="w-4 h-4" />
                             Initiate Buy
                          </Link>
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Operational</span>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        <section className="px-6 mx-auto max-w-7xl">
           {/* STATS INFRASTRUCTURE */}
           {stats && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {[
                  { label: "Total Inflow", val: stats.totalEarned, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { label: "Total Outflow", val: stats.totalSpent, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
                  { label: "Net Transmission", val: stats.netChange, icon: BarChart3, color: "text-primary", bg: "bg-primary/5" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-[40px] border border-border flex items-center justify-between hover:shadow-2xl hover:shadow-primary/5 transition-all"
                  >
                     <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-4xl font-black tracking-tighter ${s.color}`}>
                           {s.val >= 0 ? '+' : ''}{s.val}
                        </p>
                     </div>
                     <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
                        <s.icon className="w-7 h-7" />
                     </div>
                  </motion.div>
                ))}
             </div>
           )}

           {/* FILTER BAR */}
           <div className="mb-10 flex flex-wrap items-center justify-between gap-6 p-6 bg-white border border-border rounded-[32px] shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-bg-alt rounded-2xl flex items-center justify-center text-text-muted">
                    <Filter className="w-4 h-4" />
                 </div>
                 <div className="flex gap-2">
                    {['all', 'credit', 'debit'].map((f) => (
                       <button
                         key={f}
                         onClick={() => setFilter(f)}
                         className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                           filter === f ? 'bg-text-main text-white shadow-lg' : 'bg-bg-alt text-text-muted hover:bg-border'
                         }`}
                       >
                          {f}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <Calendar className="w-4 h-4 text-text-muted" />
                 <select
                   value={timeRange}
                   onChange={(e) => setTimeRange(e.target.value)}
                   className="bg-transparent text-[10px] font-black uppercase tracking-widest text-text-main focus:outline-none cursor-pointer"
                 >
                    <option value="7">Last 7 Cycles</option>
                    <option value="30">Last 30 Cycles</option>
                    <option value="90">Quarterly Sync</option>
                 </select>
              </div>
           </div>

           {/* TRANSACTION LOG */}
           <div className="bg-white rounded-[48px] border border-border overflow-hidden shadow-2xl shadow-primary/5">
              <div className="p-10 border-b border-border flex items-center justify-between bg-bg-alt/30">
                 <div>
                    <h3 className="text-xl font-black text-text-main uppercase tracking-widest">Transmission Logs</h3>
                    <p className="text-[10px] font-bold text-text-muted uppercase mt-1 tracking-widest">Live Node Activity</p>
                 </div>
                 <div className="w-12 h-12 bg-white border border-border rounded-xl flex items-center justify-center text-primary">
                    <History className="w-6 h-6" />
                 </div>
              </div>

              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center">
                   <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Reading Alpha Blocks...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-32 text-center">
                   <div className="w-24 h-24 bg-bg-alt rounded-[40px] flex items-center justify-center mx-auto mb-8">
                      <LayoutDashboard className="w-10 h-10 text-text-muted/20" />
                   </div>
                   <h4 className="text-2xl font-black text-text-main mb-2 tracking-tight">Zero Activity Recorded</h4>
                   <p className="text-sm text-text-muted font-medium italic">"Initiate a transmission to populate the ledger."</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                   {transactions.map((t, i) => (
                     <motion.div
                       key={t._id}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="p-10 hover:bg-bg-alt transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
                     >
                        <div className="flex items-center gap-8 flex-1">
                           <div className="w-16 h-16 bg-white border border-border rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all shrink-0">
                              {getReasonIcon(t.reason)}
                           </div>
                           <div className="min-w-0">
                              <p className="text-xs font-black text-text-main uppercase tracking-widest mb-1">{t.reason.replace('_', ' ')}</p>
                              <h4 className="text-lg font-black text-text-main truncate uppercase tracking-tight group-hover:text-primary transition-colors">{t.description || 'Alpha Distribution'}</h4>
                              <p className="text-[10px] font-bold text-text-muted uppercase mt-1 tracking-widest">{format(new Date(t.createdAt), 'PPp')}</p>
                           </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-[140px]">
                           <div className="flex items-center gap-2">
                              {t.type === 'credit' ? <ArrowUp className="w-4 h-4 text-emerald-500" /> : <ArrowDown className="w-4 h-4 text-red-500" />}
                              <span className={`text-3xl font-black tracking-tighter ${t.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                                 {t.type === 'credit' ? '+' : '-'}{t.amount}
                              </span>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Final State: {t.balanceAfter} TK</p>
                              {t.payment && (
                                <Link
                                  to={`/receipts/${t.payment}`}
                                  className="inline-flex items-center gap-2 mt-2 text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-widest transition-all group/link"
                                >
                                   <span>Auth Receipt</span>
                                   <FileText className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                              )}
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
              )}
           </div>

           {/* FINAL CTA SECION */}
           <div className="mt-32 p-12 lg:p-24 bg-primary rounded-[64px] relative overflow-hidden text-center group">
              <div className="absolute top-0 right-0 w-[600px] h-full bg-linear-to-bl from-white/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-2xl mx-auto">
                 <div className="inline-block px-6 py-2 bg-white/10 border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                    Node Expansion
                 </div>
                 <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-10">
                    Acquire More <span className="text-text-main italic font-serif">Power</span> Nodes.
                 </h2>
                 <p className="text-white/60 text-lg font-medium mb-12 leading-relaxed">
                    The collective network evolves when you acquire more tokens. Invest in your growth identity today.
                 </p>
                 <button 
                  onClick={() => navigate('/buy-tokens')}
                  className="px-12 py-6 bg-white text-primary rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all"
                 >
                    Initialize Purchase
                 </button>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default memo(WalletPage);

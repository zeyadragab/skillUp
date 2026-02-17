import React, { memo, useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Zap,
  Calendar,
  Filter,
  Loader2,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  ChevronRight
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { transactionsAPI } from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const TokensSection = memo(({ fullPage = false }) => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalEarned: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionsAPI.getAll({ limit: fullPage ? 50 : 6 });

      const transformedTransactions = response.transactions.map(tx => ({
        id: tx._id,
        type: tx.type === 'credit' ? 'earn' : 'spend',
        amount: tx.amount,
        description: tx.description || tx.reason.replace(/_/g, ' '),
        date: new Date(tx.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        color: tx.type === 'credit' ? 'green' : 'red',
      }));

      setTransactions(transformedTransactions);
      setSummary(response.summary || { totalEarned: 0, totalSpent: 0 });
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const balance = user?.tokens || 0;
  const totalEarned = summary.totalEarned;
  const totalSpent = summary.totalSpent;

  return (
    <div className={fullPage ? "space-y-12" : "space-y-8"}>
      {/* Overview Cards */}
      <div className={`grid grid-cols-1 ${fullPage ? "md:grid-cols-3" : ""} gap-6`}>
        {/* Balance Card */}
        <div className="p-8 bg-text-main rounded-[40px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Available Fuel</p>
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Coins className="w-5 h-5" />
                 </div>
              </div>
              <h3 className="text-4xl font-black text-white mb-2">{balance}</h3>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-8">Total Skills Tokens</p>
              <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all">
                 Purchase More
              </button>
           </div>
        </div>

        {/* Earned Stat */}
        <div className="p-8 bg-white border border-border rounded-[40px] hover:shadow-xl hover:shadow-secondary/5 transition-all group">
           <div className="flex items-start justify-between mb-8">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Total Earned</p>
                 <h3 className="text-3xl font-black text-text-main group-hover:text-secondary transition-colors">+{totalEarned}</h3>
              </div>
              <div className="w-12 h-12 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary group-hover:rotate-12 transition-transform">
                 <ArrowUpRight className="w-6 h-6" />
              </div>
           </div>
           <div className="h-1.5 w-full bg-bg-alt rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} className="h-full bg-secondary" />
           </div>
        </div>

        {/* Spent Stat */}
        <div className="p-8 bg-white border border-border rounded-[40px] hover:shadow-xl hover:shadow-accent/5 transition-all group">
           <div className="flex items-start justify-between mb-8">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Total Spent</p>
                 <h3 className="text-3xl font-black text-text-main group-hover:text-accent transition-colors">-{totalSpent}</h3>
              </div>
              <div className="w-12 h-12 bg-accent/5 rounded-2xl flex items-center justify-center text-accent group-hover:-rotate-12 transition-transform">
                 <ArrowDownLeft className="w-6 h-6" />
              </div>
           </div>
           <div className="h-1.5 w-full bg-bg-alt rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} className="h-full bg-accent" />
           </div>
        </div>
      </div>

      {/* Transaction History Canvas */}
      <div className={fullPage ? "bg-white p-10 rounded-[48px] border border-border" : ""}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-text-main tracking-tight">Ledger history</h3>
            <p className="text-text-muted font-bold text-xs uppercase tracking-widest mt-1">Detailed transaction logs</p>
          </div>
          <button className="p-4 bg-bg-alt text-text-muted hover:text-text-main rounded-2xl transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Syncing Ledger...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-20 text-center bg-bg-alt rounded-[32px] border-2 border-dashed border-border px-8">
                <Zap className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                <h4 className="text-xl font-black text-text-main mb-2">No activities recorded</h4>
                <p className="text-text-muted font-medium max-w-xs mx-auto">Complete a session or top up your wallet to start your journey.</p>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-6 bg-bg-alt border border-transparent rounded-3xl hover:bg-white hover:border-border hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      tx.type === "earn" ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent"
                    }`}>
                      {tx.type === "earn" ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-lg font-black text-text-main mb-1 group-hover:text-primary transition-colors">{tx.description}</p>
                      <div className="flex items-center space-x-4">
                         <div className="flex items-center space-x-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{tx.date}</span>
                         </div>
                         <div className="text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            View Receipt <ChevronRight className="inline-block w-3 h-3" />
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-black ${
                    tx.type === "earn" ? "text-secondary" : "text-text-main"
                  }`}>
                    {tx.type === "earn" ? "+" : "-"}{tx.amount}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {fullPage && !loading && transactions.length > 0 && (
          <button className="w-full py-5 mt-10 border-2 border-border border-dashed rounded-[32px] text-xs font-black text-text-muted hover:border-primary hover:text-primary transition-all uppercase tracking-widest">
            Load Older Transactions
          </button>
        )}
      </div>
    </div>
  );
});

TokensSection.displayName = "TokensSection";

export default TokensSection;

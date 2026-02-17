import React from "react";
import { Coins, Zap, Crown, Check } from "lucide-react";
import { motion } from "framer-motion";

const TokenCard = ({ type = "basic", tokens, price, popular = false }) => {
  const getIcon = () => {
    switch (type) {
      case "premium":
        return <Crown className="h-8 w-8 text-amber-500" />;
      case "pro":
        return <Zap className="h-8 w-8 text-primary" />;
      default:
        return <Coins className="h-8 w-8 text-secondary" />;
    }
  };

  const getStyle = () => {
    switch (type) {
      case "premium":
        return { border: "border-amber-200", bg: "bg-amber-50" };
      case "pro":
        return { border: "border-primary/20", bg: "bg-primary/5" };
      default:
        return { border: "border-border", bg: "bg-bg-alt" };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative p-8 rounded-[40px] border-2 bg-white transition-all duration-300 ${
        popular ? "border-primary shadow-2xl shadow-primary/10" : "border-border shadow-sm"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="glass border border-primary/20 text-primary px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
            Most Popular
          </span>
        </div>
      )}

      <div className={`w-16 h-16 ${style.bg} rounded-2xl flex items-center justify-center mb-8`}>
        {getIcon()}
      </div>

      <div className="mb-8">
        <h4 className="text-sm font-black text-text-muted uppercase tracking-widest mb-2">
          {type} pack
        </h4>
        <div className="flex items-baseline space-x-2">
           <span className="text-5xl font-black text-text-main">{tokens}</span>
           <span className="text-xl font-bold text-text-muted">tokens</span>
        </div>
      </div>

      <div className="mb-8">
         <div className="text-3xl font-black text-text-main mb-4">${price}</div>
         <ul className="space-y-3">
            {[1, 2, 3].map(i => (
              <li key={i} className="flex items-center space-x-3 text-sm font-semibold text-text-muted">
                <Check className="w-4 h-4 text-secondary" />
                <span>Premium Feature {i}</span>
              </li>
            ))}
         </ul>
      </div>

      <button
        className={`w-full py-5 rounded-[20px] font-black transition-all ${
          type === 'pro' || popular
            ? "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
            : "bg-bg-alt text-text-main hover:bg-border"
        }`}
      >
        Select Package
      </button>
    </motion.div>
  );
};

export default TokenCard;

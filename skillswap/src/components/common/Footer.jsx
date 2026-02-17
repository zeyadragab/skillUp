import React, { memo } from "react";
import { Sparkles, Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-bg-main border-t border-border pt-24 pb-12">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-16 mb-20 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center mb-6 group">
              <img 
                src="/logo.svg" 
                alt="SkillUp Logo" 
                className="h-12 w-auto transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <p className="text-text-muted font-medium leading-relaxed mb-8">
              Redefining educational success through peer-to-peer knowledge exchange. Join the global movement today.
            </p>
            <div className="flex space-x-5">
              {[Twitter, Facebook, Instagram, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="text-text-muted hover:text-primary transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          <div>
            <h3 className="mb-8 text-sm font-black uppercase tracking-widest text-text-main">Platform</h3>
            <ul className="space-y-4">
              {['Explore Skills', 'Browse Teachers', 'How it Works', 'Pricing'].map(item => (
                <li key={item}>
                  <a href="#" className="text-text-muted font-bold text-sm hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-8 text-sm font-black uppercase tracking-widest text-text-main">Support</h3>
            <ul className="space-y-4">
              {['Help Center', 'Community Guidelines', 'Safety Tips', 'Contact Us'].map(item => (
                <li key={item}>
                  <a href="#" className="text-text-muted font-bold text-sm hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-8 text-sm font-black uppercase tracking-widest text-text-main">Journal</h3>
            <p className="text-text-muted text-sm font-medium mb-6">
              Get the latest insights on skill development and community stories.
            </p>
            <div className="flex gap-2">
               <input 
                 type="email" 
                 placeholder="Email address"
                 className="flex-1 px-4 py-3 bg-bg-alt border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold"
               />
               <button className="px-6 py-3 bg-text-main text-white rounded-xl hover:bg-primary transition-all font-bold text-sm">
                  Join
               </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-muted text-xs font-black uppercase tracking-widest">
            &copy; 2025 SkillSwap Global. All rights reserved.
          </p>
          <div className="flex space-x-8 text-xs font-black uppercase tracking-widest text-text-muted">
             <a href="#" className="hover:text-text-main transition-colors">Privacy</a>
             <a href="#" className="hover:text-text-main transition-colors">Terms</a>
             <a href="#" className="hover:text-text-main transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);

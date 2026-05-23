import React, { memo } from "react";
import {
  Sparkles,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Github,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="pt-24 pb-12 border-t bg-bg-main border-border">
      <div className="px-6 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-16 mb-20 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center mb-6 group">
              <img
                src="/logo.svg"
                alt="SkillUp Logo"
                className="w-auto h-12 transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <p className="mb-8 font-medium leading-relaxed text-text-muted">
              {t("footer_desc")}
            </p>
            <div className="flex space-x-5">
              {[Twitter, Facebook, Instagram, Linkedin, Github].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="transition-colors text-text-muted hover:text-primary"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Nav groups */}
          <div>
            <h3 className="mb-8 text-sm font-black tracking-widest uppercase text-text-main">
              {t("footer_platform")}
            </h3>
            <ul className="space-y-4">
              {[
                { key: "footer_explore_skills", href: "/courses" },
                { key: "footer_browse_teachers", href: "/teachers" },
                { key: "footer_how_works", href: "/#how-it-works" },
                { key: "footer_pricing", href: "/#pricing" },
              ].map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    className="text-sm font-bold transition-colors text-text-muted hover:text-primary"
                  >
                    {t(item.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-8 text-sm font-black tracking-widest uppercase text-text-main">
              {t("footer_support")}
            </h3>
            <ul className="space-y-4">
              {[
                { key: "footer_help_center" },
                { key: "footer_community_guide" },
                { key: "footer_safety_tips" },
                { key: "footer_contact" },
              ].map((item) => (
                <li key={item.key}>
                  <a
                    href="#"
                    className="text-sm font-bold transition-colors text-text-muted hover:text-primary"
                  >
                    {t(item.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-8 text-sm font-black tracking-widest uppercase text-text-main">
              {t("footer_journal")}
            </h3>
            <p className="mb-6 text-sm font-medium text-text-muted">
              {t("footer_journal_desc")}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t("footer_email_placeholder")}
                className="flex-1 px-4 py-3 text-sm font-bold border outline-none bg-bg-alt border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button className="px-6 py-3 text-sm font-bold text-white transition-all bg-text-main rounded-xl hover:bg-primary">
                {t("footer_join")}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 pt-12 border-t border-border md:flex-row">
          <p className="text-xs font-black tracking-widest uppercase text-text-muted">
            &copy; {t("footer_copyright")}
          </p>
          <div className="flex space-x-8 text-xs font-black tracking-widest uppercase text-text-muted">
            <a href="#" className="transition-colors hover:text-text-main">
              {t("footer_privacy")}
            </a>
            <a href="#" className="transition-colors hover:text-text-main">
              {t("footer_terms")}
            </a>
            <a href="#" className="transition-colors hover:text-text-main">
              {t("footer_cookies")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);

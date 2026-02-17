import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useTokens } from "../context/TokenContext";
import io from "socket.io-client";
import NotificationDropdown from "./NotificationDropdown";
import { skillsAPI } from "../../services/api";
import {
  Search,
  User,
  Coins,
  ChevronDown,
  BookOpen,
  Users,
  GraduationCap,
  MessageCircle,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Target,
  Sparkles,
  Zap,
  LayoutDashboard,
  Globe,
  Star,
  ShieldCheck,
  ChevronRight,
  Clock,
  Briefcase,
  Rocket,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";

// ==================== PREMIUM DROPDOWN ITEM ====================
const NavDropdownItem = memo(({ icon: Icon, title, description, href, badge, color, onClick }) => (
  <Link
    to={href}
    onClick={onClick}
    className="flex items-center p-4 rounded-3xl transition-all hover:bg-bg-alt group"
  >
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mr-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="text-sm font-black text-text-main group-hover:text-primary transition-colors uppercase tracking-wide truncate">
          {title}
        </p>
        {badge && (
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/10">
            {badge}
          </span>
        )}
      </div>
      <p className="text-[10px] font-medium text-text-muted truncate lowercase">{description}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-border group-hover:text-primary group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
  </Link>
));

// ==================== SEARCH BAR ====================
const SearchBar = memo(() => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setSkills([]);
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [skillsRes, usersRes] = await Promise.all([
          fetch(`http://localhost:5000/api/skills?search=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setSkills(data.skills?.slice(0, 3) || []);
        }
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users?.slice(0, 3) || []);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = useCallback((path) => {
    navigate(path);
    setIsOpen(false);
    setQuery("");
  }, [navigate]);

  return (
    <div className="relative flex-1 max-w-md mx-6">
      <div className={`relative flex items-center bg-bg-alt border transition-all duration-300 rounded-2xl ${isOpen ? 'border-primary ring-4 ring-primary/5 bg-white' : 'border-border'}`}>
        <Search className={`ml-4 w-4 h-4 transition-colors ${isOpen ? 'text-primary' : 'text-text-muted'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search skills or mentors..."
          className="w-full py-2.5 px-4 bg-transparent border-none text-xs font-black uppercase tracking-widest text-text-main focus:ring-0 placeholder:text-text-muted/40"
        />
        <div className="hidden sm:flex mr-4 items-center gap-1.5 px-2 py-1 bg-white border border-border rounded-lg shadow-xs">
           <span className="text-[10px] font-black text-text-muted">⌘</span>
           <span className="text-[10px] font-black text-text-muted uppercase">K</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && query && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute left-0 right-0 mt-3 p-2 bg-white border border-border rounded-[32px] shadow-2xl z-50 overflow-hidden"
          >
            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center">
                 <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Searching Alpha...</p>
              </div>
            ) : (skills.length > 0 || users.length > 0) ? (
              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-2">
                 {skills.length > 0 && (
                   <div className="mb-6">
                      <p className="px-4 py-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Skill Nodes</p>
                      {skills.map(skill => (
                        <button key={skill.id} onClick={() => handleResultClick(`/skills/${skill.name}`)} className="w-full p-4 rounded-2xl flex items-center gap-4 hover:bg-bg-alt transition-colors group">
                           <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Target className="w-5 h-5" />
                           </div>
                           <div className="text-left">
                              <p className="text-xs font-black text-text-main group-hover:text-primary transition-colors uppercase tracking-widest">{skill.name}</p>
                              <p className="text-[10px] font-bold text-text-muted uppercase">{skill.category}</p>
                           </div>
                        </button>
                      ))}
                   </div>
                 )}
                 {users.length > 0 && (
                   <div>
                      <p className="px-4 py-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Verified Mentors</p>
                      {users.map(u => (
                        <button key={u.id} onClick={() => handleResultClick(`/profile/${u._id || u.id}`)} className="w-full p-4 rounded-2xl flex items-center gap-4 hover:bg-bg-alt transition-colors group">
                           <img 
                            src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7c3aed&color=fff`} 
                            className="w-10 h-10 rounded-xl object-cover group-hover:scale-110 transition-transform" 
                           />
                           <div className="text-left">
                              <p className="text-xs font-black text-text-main group-hover:text-primary transition-colors uppercase tracking-widest">{u.name}</p>
                              <p className="text-[10px] font-bold text-text-muted uppercase">{u.country || 'Global'}</p>
                           </div>
                        </button>
                      ))}
                   </div>
                 )}
              </div>
            ) : (
              <div className="p-10 text-center">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No signals found matching "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ==================== ADVANCED NAVBAR ====================
const AdvancedNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const { user, logout } = useUser();
  const { tokens } = useTokens();
  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await skillsAPI.getCategories();
        setCategories(data.categories || []);
      } catch (err) { console.error(err); }
    };
    fetchCategories();
  }, []);

  const navItems = [
    {
      name: "Discover",
      href: "/courses",
      icon: <Globe className="w-4 h-4" />,
      dropdown: (
        <div className="w-80 p-4 bg-white border border-border shadow-2xl rounded-[40px] overflow-hidden">
           <div className="px-4 py-2 border-b border-border mb-2">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Learning Channels</p>
           </div>
           <div className="grid grid-cols-1 gap-1">
              {categories.slice(0, 5).map(cat => (
                <NavDropdownItem 
                  key={cat.id} 
                  icon={BookOpen} 
                  title={cat.name} 
                  description={`${cat.skillCount || 0} active nodes`}
                  href={`/courses?category=${cat.name}`}
                  color="bg-primary"
                  onClick={() => setActiveDropdown(null)}
                />
              ))}
           </div>
        </div>
      )
    },
    {
      name: "Guild",
      href: "/teachers",
      icon: <Users className="w-4 h-4" />,
      dropdown: (
        <div className="w-80 p-4 bg-white border border-border shadow-2xl rounded-[40px] overflow-hidden">
           <div className="px-4 py-2 border-b border-border mb-2">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Swap Infrastructure</p>
           </div>
           <div className="space-y-1">
              <NavDropdownItem icon={GraduationCap} title="Browse Mentors" description="Find experts for your next session" href="/teachers" color="bg-secondary" onClick={() => setActiveDropdown(null)} />
              <NavDropdownItem icon={Briefcase} title="Career Swaps" description="Exchange professional expertise" href="/teachers?type=career" color="bg-accent" onClick={() => setActiveDropdown(null)} />
              <NavDropdownItem icon={Zap} title="Instant Sessions" description="Available experts right now" href="/teachers?status=online" color="bg-orange-500" onClick={() => setActiveDropdown(null)} />
           </div>
        </div>
      )
    },
    {
      name: "Ecosystem",
      href: "/community",
      icon: <Rocket className="w-4 h-4" />,
      dropdown: (
        <div className="w-80 p-4 bg-white border border-border shadow-2xl rounded-[40px] overflow-hidden">
           <div className="px-4 py-2 border-b border-border mb-2">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Platform Pulse</p>
           </div>
           <div className="space-y-1">
              <NavDropdownItem icon={LayoutDashboard} title="Global Hub" description="Community news & stats" href="/community" color="bg-indigo-500" onClick={() => setActiveDropdown(null)} />
              <NavDropdownItem icon={MessageCircle} title="Public Channels" description="Join collective discussions" href="/community#channels" color="bg-primary" onClick={() => setActiveDropdown(null)} />
              <NavDropdownItem icon={Award} title="Elite Badges" description="View community achievements" href="/community#rewards" color="bg-accent" onClick={() => setActiveDropdown(null)} />
           </div>
        </div>
      )
    }
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 flex items-center h-[72px] px-6 lg:px-12 ${
          scrolled ? "bg-white/80 backdrop-blur-xl shadow-2xl shadow-primary/5 border-b border-border" : "bg-white/50 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between">
           {/* Logo */}
           <Link to={user ? "/home" : "/"} className="flex items-center group">
              <img 
                src="/skillup.png" 
                alt="SkillUp Logo" 
                className="h-12 w-auto transition-transform duration-500 group-hover:scale-105"
              />
           </Link>

           {/* Desktop Nav */}
           <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      location.pathname.startsWith(item.href) ? "text-primary bg-primary/5 shadow-sm" : "text-text-muted hover:text-text-main hover:bg-bg-alt"
                    }`}
                  >
                    <span>{item.name}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === item.name ? "rotate-180 text-primary" : "text-text-muted/50"}`} />
                  </Link>

                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-4"
                      >
                         {item.dropdown}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
           </nav>

           <SearchBar />

           {/* Right Actions */}
           <div className="flex items-center space-x-4">
              {user ? (
                <>
                   {/* Vault Balance */}
                   <Link
                     to="/buy-tokens"
                     className="hidden md:flex items-center h-11 px-6 bg-text-main hover:bg-white hover:text-text-main border-2 border-text-main text-white rounded-2xl transition-all shadow-xl shadow-text-main/10 group"
                   >
                      <Coins className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest">{tokens} TK</span>
                      <div className="ml-3 pl-3 border-l border-white/20 group-hover:border-text-main/20">
                         <span className="text-primary font-black">+</span>
                      </div>
                   </Link>

                   <div className="flex items-center space-x-2">
                      <NotificationDropdown socket={socketRef.current} />
                      
                      <HeadlessMenu as="div" className="relative ml-2">
                        <HeadlessMenu.Button className="flex items-center p-1 bg-white border border-border shadow-sm rounded-2xl transition-all hover:border-primary group">
                           <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`} className="w-9 h-9 rounded-[14px] object-cover group-hover:scale-105 transition-transform" />
                           <ChevronDown className="mx-2 w-4 h-4 text-text-muted group-hover:text-primary" />
                        </HeadlessMenu.Button>

                        <Transition
                          as={React.Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95 y-5"
                          enterTo="transform opacity-100 scale-100 y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="transform opacity-100 scale-100 y-0"
                          leaveTo="transform opacity-0 scale-95 y-5"
                        >
                          <HeadlessMenu.Items className="absolute right-0 w-64 mt-4 bg-white border border-border rounded-[40px] shadow-2xl p-4 overflow-hidden z-50">
                             <div className="px-6 py-6 border-b border-border mb-4 bg-bg-alt/50 -mx-4 -mt-4">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Authenticated Scholar</p>
                                <p className="text-sm font-black text-text-main uppercase tracking-tight truncate">{user.name}</p>
                                <div className="flex items-center gap-2 mt-3">
                                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Operational State</span>
                                </div>
                             </div>
                             
                             <div className="space-y-1">
                                <HeadlessMenu.Item>
                                  {({ active }) => (
                                    <Link to="/profile" className={`flex items-center p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${active ? 'bg-primary/5 text-primary' : 'text-text-main'}`}>
                                       <User className="w-4 h-4 mr-3" /> Profile Node
                                    </Link>
                                  )}
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item>
                                  {({ active }) => (
                                    <Link to="/sessions" className={`flex items-center p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${active ? 'bg-primary/5 text-primary' : 'text-text-main'}`}>
                                       <Clock className="w-4 h-4 mr-3" /> Live Sessions
                                    </Link>
                                  )}
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item>
                                  {({ active }) => (
                                    <Link to="/chat" className={`flex items-center p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${active ? 'bg-primary/5 text-primary' : 'text-text-main'}`}>
                                       <MessageCircle className="w-4 h-4 mr-3" /> Eco Transmissions
                                    </Link>
                                  )}
                                </HeadlessMenu.Item>
                             </div>
                             
                             <div className="my-3 border-t border-border -mx-4" />
                             
                             <HeadlessMenu.Item>
                                {({ active }) => (
                                  <button onClick={logout} className={`flex items-center w-full p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors ${active ? 'bg-red-50 text-red-600' : 'text-red-500'}`}>
                                     <LogOut className="w-4 h-4 mr-3" /> Deauthorize session
                                  </button>
                                )}
                             </HeadlessMenu.Item>
                          </HeadlessMenu.Items>
                        </Transition>
                      </HeadlessMenu>
                   </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                   <Link to="/signin" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors">Sign In</Link>
                   <Link to="/signup" className="px-8 py-3 bg-text-main text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-text-main/10 hover:scale-105 active:scale-95 transition-all">Onboard</Link>
                </div>
              )}

              {/* Mobile Menu Trigger */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-11 h-11 bg-bg-alt rounded-2xl flex items-center justify-center text-text-main hover:bg-white border border-transparent hover:border-border transition-all"
              >
                 <Menu className="w-5 h-5" />
              </button>
           </div>
        </div>
      </header>

      {/* MOBILE MENU PANEL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-text-main/40 backdrop-blur-xl flex justify-end"
          >
             <motion.div
               initial={{ x: "100%" }}
               animate={{ x: 0 }}
               exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="w-full max-w-[340px] h-full bg-white shadow-2xl p-8 flex flex-col"
             >
                <div className="flex items-center justify-between mb-12">
                   <img 
                      src="/skillup.png" 
                      alt="SkillUp Logo" 
                      className="h-10 w-auto"
                    />
                   <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 bg-bg-alt rounded-2xl flex items-center justify-center text-text-muted">
                      {/* <X className="w-5 h-5" /> */}
                   </button>
                </div>

                <nav className="flex-1 space-y-2">
                   {navItems.map((item, i) => (
                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={item.name}>
                        <Link 
                          to={item.href} 
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between p-5 bg-bg-alt rounded-[28px] group hover:bg-primary transition-all"
                        >
                           <div className="flex items-center gap-4">
                              <span className="p-3 bg-white rounded-xl shadow-sm group-hover:rotate-12 transition-transform">{item.icon}</span>
                              <span className="text-sm font-black text-text-main uppercase tracking-widest group-hover:text-white transition-colors">{item.name}</span>
                           </div>
                           <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </Link>
                     </motion.div>
                   ))}
                </nav>

                <div className="pt-8 border-t border-border mt-8">
                   {user ? (
                     <div className="space-y-4">
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center h-16 px-6 bg-white border border-border rounded-[28px] gap-4">
                           <img src={user.avatar} className="w-10 h-10 rounded-xl" />
                           <div>
                              <p className="text-xs font-black text-text-main uppercase tracking-widest">{user.name}</p>
                              <p className="text-[10px] font-bold text-text-muted uppercase">My Profile Node</p>
                           </div>
                        </Link>
                        <button onClick={logout} className="w-full py-5 bg-red-50 text-red-600 rounded-[28px] text-[10px] font-black uppercase tracking-widest">Deauthorize</button>
                     </div>
                   ) : (
                     <div className="grid grid-cols-2 gap-4">
                        <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="py-4 text-center text-[10px] font-black uppercase tracking-widest bg-bg-alt rounded-2xl">Sign In</Link>
                        <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="py-4 text-center text-[10px] font-black uppercase tracking-widest bg-text-main text-white rounded-2xl">Onboard</Link>
                     </div>
                   )}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </>
  );
};

export default memo(AdvancedNavbar);

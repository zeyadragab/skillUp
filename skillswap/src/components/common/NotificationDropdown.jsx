import { useState, useEffect, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { notificationAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Check,
  Trash2,
  X,
  BellRing,
  Sparkles,
  Zap,
  Award,
  Coins,
  MessageCircle,
  Users,
  Calendar,
  ShieldCheck,
  MoreHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = ({ socket }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    if (socket) {
      socket.on('notification', handleNewNotification);
      return () => socket.off('notification', handleNewNotification);
    }
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    if (notification.priority === 'high' || notification.priority === 'urgent') {
      toast.info(notification.title, {
        onClick: () => {
          if (notification.actionUrl) window.location.href = notification.actionUrl;
        }
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications({ limit: 15 });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) { console.error(error); }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) { console.error(error); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('System synchronization complete');
    } catch (error) { toast.error('Sync failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) { console.error(error); }
  };

  const getTypeIcon = (type) => {
    const map = {
      session_booked: { icon: Calendar, color: 'text-primary' },
      tokens_purchased: { icon: Coins, color: 'text-accent' },
      new_follower: { icon: Users, color: 'text-secondary' },
      new_message: { icon: MessageCircle, color: 'text-indigo-500' },
      account_verified: { icon: ShieldCheck, color: 'text-emerald-500' },
      welcome: { icon: Sparkles, color: 'text-primary' },
    };
    const Config = map[type] || { icon: BellRing, color: 'text-text-muted' };
    return <Config.icon className={`w-4 h-4 ${Config.color}`} />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-2 rounded-2xl bg-bg-alt hover:bg-white border border-transparent hover:border-border transition-all"
      >
        <AnimatePresence mode="wait">
          {unreadCount > 0 ? (
            <motion.div
              key="bell-active"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative"
            >
              <BellRing className="w-5 h-5 text-primary" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
            </motion.div>
          ) : (
            <motion.div
              key="bell-idle"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <Bell className="w-5 h-5 text-text-muted group-hover:text-text-main transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Responsive Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed inset-x-4 top-20 lg:absolute lg:inset-auto lg:right-0 lg:-mr-12 lg:mt-4 w-auto lg:w-[440px] bg-white rounded-[40px] border border-border shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-white">
              <div>
                 <h3 className="text-xl font-black text-text-main tracking-tight uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Updates
                 </h3>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">
                    {unreadCount} Unread Transmissions
                 </p>
              </div>
              <div className="flex items-center gap-3">
                 {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-black uppercase text-primary hover:text-primary-hover tracking-widest transition-colors"
                    >
                       Clear All
                    </button>
                 )}
                 <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-bg-alt flex items-center justify-center text-text-muted hover:text-text-main transition-colors">
                    <X className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[60vh] lg:max-h-[500px] overflow-y-auto custom-scrollbar p-2">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                   <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Scanning Network...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-20 text-center px-10">
                   <div className="w-20 h-20 bg-bg-alt rounded-[32px] flex items-center justify-center mx-auto mb-6">
                      <Bell className="w-10 h-10 text-text-muted/20" />
                   </div>
                   <h4 className="text-lg font-black text-text-main mb-2">Zero Pulsations</h4>
                   <p className="text-sm text-text-muted font-medium italic">"Your notification grid is currently silent."</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((n, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      key={n._id}
                      className={`p-5 rounded-[28px] transition-all relative group flex items-start gap-5 ${
                        !n.isRead ? 'bg-primary/5 border-l-4 border-primary' : 'bg-white hover:bg-bg-alt'
                      }`}
                    >
                      {/* Left: Dynamic Icon */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                         !n.isRead ? 'bg-white' : 'bg-bg-alt'
                      }`}>
                         {getTypeIcon(n.type)}
                      </div>

                      {/* Center: Content */}
                      <div className="flex-1 min-w-0 pr-6">
                         <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-black truncate ${!n.isRead ? 'text-text-main' : 'text-text-muted'}`}>
                               {n.title}
                            </h4>
                            <span className="text-[10px] font-black text-text-muted/60 uppercase whitespace-nowrap ml-2">
                               {formatDistanceToNow(new Date(n.createdAt), { addSuffix: false })}
                            </span>
                         </div>
                         <p className="text-xs text-text-muted font-medium leading-relaxed line-clamp-2">
                            {n.message}
                         </p>

                         {n.actionUrl && (
                           <Link
                             to={n.actionUrl}
                             onClick={() => {
                               handleMarkAsRead(n._id);
                               setIsOpen(false);
                             }}
                             className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase text-primary tracking-widest group/link"
                           >
                             <span>Authorize Action</span>
                             <MoreHorizontal className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                           </Link>
                         )}
                      </div>

                      {/* Right: Contextual Actions */}
                      <div className="hidden group-hover:flex flex-col gap-2 absolute right-4 top-1/2 -translate-y-1/2">
                         {!n.isRead && (
                           <button
                             onClick={() => handleMarkAsRead(n._id)}
                             className="p-2 bg-white text-emerald-500 rounded-xl shadow-lg border border-border hover:bg-emerald-50 transition-all"
                             title="Acknowledge"
                           >
                             <Check className="w-3 h-3" />
                           </button>
                         )}
                         <button
                           onClick={() => handleDelete(n._id)}
                           className="p-2 bg-white text-red-500 rounded-xl shadow-lg border border-border hover:bg-red-50 transition-all"
                           title="Exterminate"
                         >
                           <Trash2 className="w-3 h-3" />
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-bg-alt/50 border-t border-border flex items-center justify-between">
               <button 
                 onClick={() => {}} // Could be clear read
                 className="text-[10px] font-black uppercase text-text-muted hover:text-text-main tracking-widest transition-colors flex items-center gap-2"
               >
                  <Trash2 className="w-3 h-3" />
                  Prune History
               </button>
               <Link
                 to="/notifications"
                 onClick={() => setIsOpen(false)}
                 className="px-6 py-2.5 bg-text-main text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-text-main/10"
               >
                 View All Grid
               </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default memo(NotificationDropdown);

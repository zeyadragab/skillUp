import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Plus, ChevronDown, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { openCommandPalette } from '../common/CommandPalette';
import { notificationsApi } from '../../services/api';

const pageTitles: Record<string, { title: string; crumb: string }> = {
  '/dashboard':     { title: 'Operations',    crumb: 'Live overview' },
  '/users':         { title: 'Users',          crumb: 'Accounts & profiles' },
  '/teachers':      { title: 'Teachers',       crumb: 'Verification & accounts' },
  '/skills':        { title: 'Skills',         crumb: 'Categories & approvals' },
  '/sessions':      { title: 'Sessions',       crumb: 'Learning sessions' },
  '/transactions':  { title: 'Transactions',   crumb: 'Token history' },
  '/reports':       { title: 'Reports',        crumb: 'Disputes & reports' },
  '/reviews':       { title: 'Reviews',        crumb: 'Platform reviews' },
  '/notifications': { title: 'Notifications',  crumb: 'Broadcast & manage' },
  '/settings':      { title: 'Settings',       crumb: 'Platform configuration' },
};

interface AdminNotif {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedUser?: { name: string };
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminNotifs, setAdminNotifs] = useState<AdminNotif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentPath = '/' + location.pathname.split('/')[1];
  const page = pageTitles[currentPath] ?? { title: 'Admin', crumb: '' };

  const fetchAdminNotifs = useCallback(async () => {
    try {
      const res = await notificationsApi.getNotifications({ limit: 6, status: 'active' });
      const items: AdminNotif[] = (res.data.data || []).map((n: any) => ({
        _id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.status === 'sent',
        createdAt: n.createdAt,
      }));
      setAdminNotifs(items);
      setUnreadCount(items.filter(n => !n.isRead).length);
    } catch {
      // silently ignore if bell fails
    }
  }, []);

  // Fetch on mount and every 2 minutes
  useEffect(() => {
    fetchAdminNotifs();
    const interval = setInterval(fetchAdminNotifs, 120_000);
    return () => clearInterval(interval);
  }, [fetchAdminNotifs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="shrink-0 h-14 bg-panel border-b border-edge flex items-center justify-between px-6 gap-4 z-30">
      {/* Page identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <h1 className="text-[15px] font-semibold text-fg-1 leading-none">{page.title}</h1>
        {page.crumb && (
          <>
            <span className="text-edge-2 text-sm select-none">/</span>
            <span className="text-[13px] text-fg-3 truncate hidden sm:block">{page.crumb}</span>
          </>
        )}
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Search — opens command palette */}
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 h-8 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-3 hover:text-fg-1 hover:border-edge-2 transition-colors"
          aria-label="Open command palette"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="w-40 text-left truncate">Search anything…</span>
          <kbd className="ml-1 text-[10px] font-mono bg-white/5 border border-white/10 rounded px-1 py-px text-fg-rail shrink-0">⌘K</kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={openCommandPalette}
          className="sm:hidden w-8 h-8 flex items-center justify-center text-fg-3 hover:text-fg-1 hover:bg-canvas rounded-lg transition-colors"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick action — also opens palette */}
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-1.5 h-8 px-3 text-[13px] font-semibold text-[oklch(15%_0.008_55)] bg-accent hover:bg-accent-hi rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick action</span>
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-8 h-8 flex items-center justify-center text-fg-2 hover:text-fg-1 hover:bg-canvas rounded-lg transition-colors"
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-err rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-panel-hi border border-edge rounded-xl overflow-hidden z-50" style={{ boxShadow: '0 0 0 1px oklch(30% 0.016 260), 0 16px 40px oklch(0% 0 0 / 0.45)' }}>
              <div className="px-4 py-3 border-b border-edge flex items-center justify-between">
                <span className="text-[13px] font-semibold text-fg-1">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-err-bg text-err">
                      {unreadCount} active
                    </span>
                  )}
                  <button
                    onClick={fetchAdminNotifs}
                    className="text-fg-3 hover:text-fg-1 transition-colors"
                    title="Refresh"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-edge max-h-72 overflow-y-auto">
                {adminNotifs.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[13px] text-fg-3">No notifications</div>
                ) : (
                  adminNotifs.map(n => (
                    <div key={n._id} className={`px-4 py-3 flex items-start gap-3 hover:bg-canvas transition-colors cursor-pointer ${n.isRead ? 'opacity-60' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                        n.type === 'success' ? 'bg-ok' :
                        n.type === 'warning' ? 'bg-warn' :
                        n.type === 'error' ? 'bg-err' : 'bg-accent'
                      } ${n.isRead ? 'opacity-0' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-fg-1 leading-snug font-medium">{n.title}</p>
                        <p className="text-[11px] text-fg-3 truncate mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-fg-3 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-edge">
                <button
                  onClick={() => { navigate('/notifications'); setNotifOpen(false); }}
                  className="w-full text-[12px] font-medium text-fg-2 hover:text-fg-1 transition-colors text-center"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-edge">
          <div className="w-7 h-7 rounded-full bg-rail flex items-center justify-center text-[11px] font-bold text-fg-inv shrink-0">
            {admin?.name?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <div className="hidden sm:block leading-none">
            <p className="text-[13px] font-medium text-fg-1">{admin?.name ?? 'Admin'}</p>
            <p className="text-[11px] text-fg-3 capitalize">{admin?.role?.replace('_', ' ') ?? 'admin'}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-fg-3 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

export default Header;

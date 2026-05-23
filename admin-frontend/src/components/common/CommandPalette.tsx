import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, Users, GraduationCap, BookOpen,
  CalendarDays, Coins, Flag, Star, Bell, Settings, BarChart2,
  User, ArrowRight, Loader2, X,
} from 'lucide-react';
import { usersApi } from '../../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type ResultKind = 'page' | 'user';

interface PageResult {
  kind: 'page';
  id: string;
  label: string;
  crumb: string;
  path: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface UserResult {
  kind: 'user';
  id: string;
  label: string;
  crumb: string;
  path: string;
  avatar?: string;
  isBanned: boolean;
  isVerified: boolean;
}

type Result = PageResult | UserResult;

// ── Static page registry ──────────────────────────────────────────────────────

const PAGES: PageResult[] = [
  { kind: 'page', id: 'dashboard',     label: 'Operations',      crumb: 'Live overview',          path: '/dashboard',     icon: LayoutDashboard },
  { kind: 'page', id: 'analytics',     label: 'Analytics',       crumb: 'Charts & trends',        path: '/analytics',     icon: BarChart2 },
  { kind: 'page', id: 'users',         label: 'Users',           crumb: 'Accounts & profiles',    path: '/users',         icon: Users },
  { kind: 'page', id: 'teachers',      label: 'Teachers',        crumb: 'Verification & accounts',path: '/teachers',      icon: GraduationCap },
  { kind: 'page', id: 'skills',        label: 'Skills',          crumb: 'Categories & approvals', path: '/skills',        icon: BookOpen },
  { kind: 'page', id: 'sessions',      label: 'Sessions',        crumb: 'Learning sessions',      path: '/sessions',      icon: CalendarDays },
  { kind: 'page', id: 'transactions',  label: 'Transactions',    crumb: 'Token history',          path: '/transactions',  icon: Coins },
  { kind: 'page', id: 'reports',       label: 'Reports',         crumb: 'Disputes & reports',     path: '/reports',       icon: Flag },
  { kind: 'page', id: 'reviews',       label: 'Reviews',         crumb: 'Platform reviews',       path: '/reviews',       icon: Star },
  { kind: 'page', id: 'notifications', label: 'Notifications',   crumb: 'Broadcast & manage',     path: '/notifications', icon: Bell },
  { kind: 'page', id: 'settings',      label: 'Settings',        crumb: 'Platform configuration', path: '/settings',      icon: Settings },
];

// ── Hook to expose palette open/close globally ────────────────────────────────

let _openPalette: (() => void) | null = null;
export function openCommandPalette() { _openPalette?.(); }

// ── Component ─────────────────────────────────────────────────────────────────

const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Register global opener
  useEffect(() => {
    _openPalette = () => setOpen(true);
    return () => { _openPalette = null; };
  }, []);

  // Keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  // Build results from query
  const buildResults = useCallback(async (q: string) => {
    const trimmed = q.trim().toLowerCase();

    // No query → show all pages
    if (!trimmed) {
      setResults(PAGES);
      setActiveIdx(0);
      setSearching(false);
      return;
    }

    // Page matches (instant)
    const pageMatches = PAGES.filter(p =>
      p.label.toLowerCase().includes(trimmed) || p.crumb.toLowerCase().includes(trimmed)
    );

    setResults(pageMatches);
    setSearching(true);

    // User search (debounced)
    try {
      const res = await usersApi.getUsers({ search: trimmed, limit: 6 });
      const users: UserResult[] = (res.data.data || []).map((u: any) => ({
        kind: 'user',
        id: u._id,
        label: u.name,
        crumb: u.email,
        path: `/users/${u._id}`,
        avatar: u.avatar,
        isBanned: u.isBanned,
        isVerified: u.isVerified,
      }));
      setResults([...pageMatches, ...users]);
      setActiveIdx(0);
    } catch {
      // user search failed — keep page results
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce query changes
  useEffect(() => {
    if (!open) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => buildResults(query), query ? 280 : 0);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query, open, buildResults]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[activeIdx];
      if (r) { navigate(r.path); setOpen(false); }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const select = (r: Result) => { navigate(r.path); setOpen(false); };

  if (!open) return null;

  // Separate pages from users for grouped display
  const pageResults = results.filter(r => r.kind === 'page') as PageResult[];
  const userResults = results.filter(r => r.kind === 'user') as UserResult[];
  const hasPages = pageResults.length > 0;
  const hasUsers = userResults.length > 0;

  // Global index offset for users (after pages)
  const userOffset = pageResults.length;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center pt-[12vh]"
      style={{ background: 'oklch(0% 0 0 / 0.65)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div
        className="w-full max-w-[560px] mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'oklch(18% 0.013 260)',
          border: '1px solid oklch(28% 0.015 260)',
          boxShadow: '0 0 0 1px oklch(32% 0.018 260), 0 24px 60px oklch(0% 0 0 / 0.6)',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
          {searching
            ? <Loader2 className="w-4 h-4 text-fg-rail animate-spin shrink-0" />
            : <Search className="w-4 h-4 text-fg-rail shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, users, or actions…"
            className="flex-1 bg-transparent text-[14px] text-fg-inv placeholder:text-fg-rail focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-fg-rail hover:text-fg-inv transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-fg-rail bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[380px] overflow-y-auto py-2">
          {results.length === 0 && !searching && (
            <div className="px-4 py-8 text-center text-[13px] text-fg-rail">
              No results for <span className="text-fg-inv font-medium">"{query}"</span>
            </div>
          )}

          {/* Pages group */}
          {hasPages && (
            <div>
              {query && <p className="px-4 py-1.5 text-[10px] font-semibold text-fg-rail uppercase tracking-widest">Pages</p>}
              {pageResults.map((r, localIdx) => {
                const idx = localIdx;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    data-idx={idx}
                    onClick={() => select(r)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                      activeIdx === idx ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activeIdx === idx ? 'bg-accent text-[oklch(15%_0.008_55)]' : 'bg-white/5 text-fg-rail'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-fg-inv">{r.label}</p>
                      <p className="text-[11px] text-fg-rail truncate">{r.crumb}</p>
                    </div>
                    {activeIdx === idx && <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Users group */}
          {hasUsers && (
            <div className={hasPages ? 'mt-1' : ''}>
              <p className="px-4 py-1.5 text-[10px] font-semibold text-fg-rail uppercase tracking-widest">Users</p>
              {userResults.map((r, localIdx) => {
                const idx = userOffset + localIdx;
                return (
                  <button
                    key={r.id}
                    data-idx={idx}
                    onClick={() => select(r)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                      activeIdx === idx ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    {r.avatar ? (
                      <img src={r.avatar} alt={r.label} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[13px] font-bold ${
                        activeIdx === idx ? 'bg-accent text-[oklch(15%_0.008_55)]' : 'bg-white/5 text-fg-rail'
                      }`}>
                        {r.label?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-medium text-fg-inv truncate">{r.label}</p>
                        {r.isBanned && (
                          <span className="text-[9px] font-bold px-1 py-px rounded bg-err/20 text-err uppercase tracking-wide shrink-0">Banned</span>
                        )}
                        {r.isVerified && !r.isBanned && (
                          <span className="text-[9px] font-bold px-1 py-px rounded bg-blue-500/15 text-blue-400 uppercase tracking-wide shrink-0">Verified</span>
                        )}
                      </div>
                      <p className="text-[11px] text-fg-rail truncate">{r.crumb}</p>
                    </div>
                    {activeIdx === idx && <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-[11px] text-fg-rail">
          <span className="flex items-center gap-1">
            <kbd className="font-mono bg-white/5 border border-white/10 rounded px-1 py-px">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono bg-white/5 border border-white/10 rounded px-1 py-px">↵</kbd> open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono bg-white/5 border border-white/10 rounded px-1 py-px">esc</kbd> close
          </span>
          <span className="ml-auto">{results.length} result{results.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

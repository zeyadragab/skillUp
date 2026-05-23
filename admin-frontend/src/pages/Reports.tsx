import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle, CheckCircle, XCircle, MessageSquare, Flag,
  RefreshCw, Eye, Filter, Plus, ChevronDown, User, Clock,
  ShieldAlert, Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { Report, Pagination } from '../types';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

// ── Style constants ───────────────────────────────────────────────────────────
const selectCls = 'h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 focus:outline-none focus:border-edge-2 transition-colors';
const textareaCls = 'w-full px-3 py-2.5 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors resize-none';
const inputCls = 'w-full h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors';
const labelCls = 'block text-[11px] font-semibold text-fg-3 uppercase tracking-wider mb-1.5';

// ── Helpers ───────────────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'bg-err/10 text-err border-err/20',
  high:   'bg-warn/10 text-warn border-warn/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  low:    'bg-white/5 text-fg-rail border-white/10',
};
const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-err', high: 'bg-warn', medium: 'bg-blue-400', low: 'bg-fg-rail',
};
const STATUS_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  resolved: 'success', dismissed: 'default', in_review: 'info', pending: 'warning',
};

function userName(u: any): string { return typeof u === 'object' ? u?.name || 'Unknown' : 'Unknown'; }
function userEmail(u: any): string { return typeof u === 'object' ? u?.email || '' : ''; }
function userId(u: any): string | null { return typeof u === 'object' ? u?._id || null : null; }

// ── Stat mini card ────────────────────────────────────────────────────────────
const Mini: React.FC<{ label: string; value: number; icon: React.ReactNode; color?: string }> = ({ label, value, icon, color = 'text-accent' }) => (
  <div className="rounded-xl border border-white/5 bg-rail p-4 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-[11px] text-fg-rail uppercase tracking-wider">{label}</p>
      <p className="text-[20px] font-bold text-fg-inv leading-tight">{value.toLocaleString()}</p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, pages: 0 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Detail drawer
  const [detail, setDetail] = useState<Report | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Note
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Resolve modal
  const [resolveModal, setResolveModal] = useState<Report | null>(null);
  const [resolveData, setResolveData] = useState({ action: '', notes: '', banUser: false });
  const [resolving, setResolving] = useState(false);

  // Dismiss modal
  const [dismissModal, setDismissModal] = useState<Report | null>(null);
  const [dismissNotes, setDismissNotes] = useState('');
  const [dismissing, setDismissing] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getReports({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(typeFilter && { type: typeFilter }),
      });
      setReports(res.data.data || []);
      setPagination(p => ({ ...p, ...res.data.pagination }));
    } catch (e: any) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, priorityFilter, typeFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Open detail drawer — fetch full report with notes + resolution
  const openDetail = async (report: Report) => {
    setDetail(report);
    setDetailLoading(true);
    setNoteText('');
    try {
      const res = await reportsApi.getReport(report._id);
      setDetail(res.data.data);
    } catch { /* keep basic data */ }
    finally { setDetailLoading(false); }
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (report: Report, status: string) => {
    setUpdatingStatus(true);
    try {
      await reportsApi.updateStatus(report._id, { status });
      toast.success(`Moved to ${status.replace('_', ' ')}`);
      setReports(prev => prev.map(r => r._id === report._id ? { ...r, status: status as any } : r));
      if (detail?._id === report._id) setDetail(d => d ? { ...d, status: status as any } : d);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
    } finally { setUpdatingStatus(false); }
  };

  const handleAddNote = async () => {
    if (!detail || !noteText.trim()) { toast.error('Enter a note'); return; }
    setAddingNote(true);
    try {
      await reportsApi.addNote(detail._id, noteText);
      toast.success('Note added');
      setNoteText('');
      // Re-fetch detail to show new note
      const res = await reportsApi.getReport(detail._id);
      setDetail(res.data.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add note');
    } finally { setAddingNote(false); }
  };

  const handleResolve = async () => {
    if (!resolveModal) return;
    if (!resolveData.action) { toast.error('Select an action'); return; }
    setResolving(true);
    try {
      await reportsApi.resolveReport(resolveModal._id, resolveData);
      toast.success('Report resolved');
      setResolveModal(null);
      setResolveData({ action: '', notes: '', banUser: false });
      setReports(prev => prev.map(r => r._id === resolveModal._id ? { ...r, status: 'resolved' as any } : r));
      if (detail?._id === resolveModal._id) setDetail(d => d ? { ...d, status: 'resolved' as any } : d);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to resolve');
    } finally { setResolving(false); }
  };

  const handleDismiss = async () => {
    if (!dismissModal) return;
    setDismissing(true);
    try {
      await reportsApi.dismissReport(dismissModal._id, dismissNotes || 'Dismissed by admin');
      toast.success('Report dismissed');
      setDismissModal(null);
      setDismissNotes('');
      setReports(prev => prev.map(r => r._id === dismissModal._id ? { ...r, status: 'dismissed' as any } : r));
      if (detail?._id === dismissModal._id) setDetail(d => d ? { ...d, status: 'dismissed' as any } : d);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to dismiss');
    } finally { setDismissing(false); }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const pending   = reports.filter(r => r.status === 'pending').length;
  const inReview  = reports.filter(r => r.status === 'in_review').length;
  const resolved  = reports.filter(r => r.status === 'resolved').length;
  const urgent    = reports.filter(r => r.priority === 'urgent').length;

  const canAct = (r: Report) => r.status === 'pending' || r.status === 'in_review';

  return (
    <div className="p-5 space-y-5">

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Mini label="Total" value={pagination.total} icon={<Flag className="w-4 h-4" />} color="text-accent" />
        <Mini label="Pending" value={pending} icon={<AlertTriangle className="w-4 h-4" />} color="text-warn" />
        <Mini label="In Review" value={inReview} icon={<MessageSquare className="w-4 h-4" />} color="text-blue-400" />
        <Mini label="Urgent" value={urgent} icon={<ShieldAlert className="w-4 h-4" />} color="text-err" />
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-panel border border-edge rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-fg-3">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-[12px] font-medium">Filters</span>
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="h-8 px-2.5 bg-canvas border border-edge rounded-lg text-[12px] text-fg-1 focus:outline-none">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="h-8 px-2.5 bg-canvas border border-edge rounded-lg text-[12px] text-fg-1 focus:outline-none">
          <option value="">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="h-8 px-2.5 bg-canvas border border-edge rounded-lg text-[12px] text-fg-1 focus:outline-none">
          <option value="">All Types</option>
          <option value="spam">Spam</option>
          <option value="harassment">Harassment</option>
          <option value="inappropriate">Inappropriate</option>
          <option value="scam">Scam</option>
          <option value="other">Other</option>
        </select>
        <button onClick={fetchReports} className="p-1.5 rounded-lg text-fg-3 hover:text-fg-1 hover:bg-canvas border border-edge transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <div className="text-[12px] text-fg-rail ml-auto">{pagination.total} report{pagination.total !== 1 ? 's' : ''}</div>
      </div>

      {/* ── Report list ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/5 bg-rail overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-[76px] bg-canvas animate-pulse border-b border-white/5 last:border-0" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-fg-rail">
            <Flag className="w-8 h-8 opacity-30" />
            <p className="text-[13px]">No reports found</p>
          </div>
        ) : (
          <div>
            {reports.map((report, i) => (
              <div
                key={report._id}
                onClick={() => openDetail(report)}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/3 transition-colors ${i < reports.length - 1 ? 'border-b border-white/4' : ''}`}
              >
                {/* Priority dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[report.priority] || 'bg-fg-rail'}`} />

                {/* Users */}
                <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4">
                  <div className="min-w-0">
                    <p className="text-[11px] text-fg-rail mb-0.5">Reporter</p>
                    <p className="text-[13px] font-medium text-fg-inv truncate">{userName(report.reporter)}</p>
                    <p className="text-[11px] text-fg-rail truncate">{userEmail(report.reporter)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-fg-rail mb-0.5">Reported</p>
                    <p className="text-[13px] font-medium text-fg-inv truncate">{userName(report.reportedUser)}</p>
                    <p className="text-[11px] text-fg-rail truncate">{userEmail(report.reportedUser)}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize ${PRIORITY_COLOR[report.priority] || PRIORITY_COLOR.low}`}>
                    {report.priority}
                  </span>
                  <Badge variant={STATUS_VARIANT[report.status] || 'default'}>{report.status.replace('_', ' ')}</Badge>
                  {report.type && <span className="text-[11px] text-fg-rail capitalize hidden sm:block">{report.type}</span>}
                  <span className="text-[11px] text-fg-rail hidden md:block">{format(new Date(report.createdAt), 'MMM d')}</span>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => openDetail(report)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-fg-rail hover:text-fg-inv hover:bg-white/5 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {canAct(report) && (
                    <>
                      <button
                        onClick={() => { setResolveModal(report); setResolveData({ action: '', notes: '', banUser: false }); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-ok/70 hover:text-ok hover:bg-ok/10 transition-colors"
                        title="Resolve"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setDismissModal(report); setDismissNotes(''); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-fg-rail hover:text-warn hover:bg-warn/10 transition-colors"
                        title="Dismiss"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/4">
            <span className="text-[12px] text-fg-rail">
              {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                  className={`w-7 h-7 rounded-md text-[12px] font-medium transition-colors ${p === pagination.page ? 'bg-accent text-[oklch(15%_0.008_55)]' : 'text-fg-rail hover:text-fg-inv hover:bg-white/5'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail drawer ─────────────────────────────────────────────────── */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Report Details" size="lg">
        {detail && (
          <div className="space-y-5">
            {detailLoading && <div className="h-1 w-full rounded-full bg-accent/30 animate-pulse" />}

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className={`px-2.5 py-1 rounded border text-[11px] font-semibold capitalize ${PRIORITY_COLOR[detail.priority] || PRIORITY_COLOR.low}`}>
                {detail.priority}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={STATUS_VARIANT[detail.status] || 'default'}>{detail.status.replace('_', ' ')}</Badge>
                  {detail.type && <span className="text-[12px] text-fg-rail capitalize">{detail.type}</span>}
                  <span className="text-[12px] text-fg-rail">{format(new Date(detail.createdAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
                <p className="text-[13px] text-fg-inv mt-1 font-medium">{detail.reason}</p>
                {detail.description && <p className="text-[12px] text-fg-rail mt-0.5">{detail.description}</p>}
              </div>
            </div>

            {/* Users grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Reporter', user: detail.reporter },
                { label: 'Reported User', user: detail.reportedUser },
              ].map(({ label, user }) => (
                <div key={label} className="p-3 rounded-xl bg-canvas border border-edge">
                  <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-wider mb-2">{label}</p>
                  <div className="flex items-center gap-2.5">
                    {(user as any)?.avatar ? (
                      <img src={(user as any).avatar} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-[12px] font-bold text-accent shrink-0">
                        {userName(user).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-fg-inv truncate">{userName(user)}</p>
                      <p className="text-[11px] text-fg-rail truncate">{userEmail(user)}</p>
                    </div>
                  </div>
                  {userId(user) && (
                    <button
                      onClick={() => { navigate(`/users/${userId(user)}`); setDetail(null); }}
                      className="mt-2 text-[11px] text-accent hover:underline"
                    >
                      View profile →
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Status controls (if actionable) */}
            {canAct(detail) && (
              <div className="flex flex-wrap gap-2">
                <p className="w-full text-[11px] font-semibold text-fg-3 uppercase tracking-wider">Change Status</p>
                {['pending', 'in_review'].filter(s => s !== detail.status).map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(detail, s)}
                    disabled={updatingStatus}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 bg-white/5 text-[12px] font-medium text-fg-rail hover:text-fg-inv hover:bg-white/8 transition-colors disabled:opacity-50 capitalize"
                  >
                    <Clock className="w-3 h-3" /> Move to {s.replace('_', ' ')}
                  </button>
                ))}
                <button
                  onClick={() => { setResolveModal(detail); setResolveData({ action: '', notes: '', banUser: false }); }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-ok/20 bg-ok/10 text-[12px] font-medium text-ok hover:bg-ok/20 transition-colors"
                >
                  <CheckCircle className="w-3 h-3" /> Resolve
                </button>
                <button
                  onClick={() => { setDismissModal(detail); setDismissNotes(''); }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-warn/20 bg-warn/10 text-[12px] font-medium text-warn hover:bg-warn/20 transition-colors"
                >
                  <XCircle className="w-3 h-3" /> Dismiss
                </button>
              </div>
            )}

            {/* Resolution (if resolved/dismissed) */}
            {detail.resolution && (
              <div className="p-3 rounded-xl bg-canvas border border-edge">
                <p className="text-[11px] font-semibold text-fg-3 uppercase tracking-wider mb-2">Resolution</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-semibold text-fg-inv capitalize">{detail.resolution.action?.replace(/_/g, ' ')}</span>
                  {detail.resolution.resolvedAt && (
                    <span className="text-[11px] text-fg-rail">{format(new Date(detail.resolution.resolvedAt), 'MMM d, yyyy HH:mm')}</span>
                  )}
                </div>
                {detail.resolution.notes && <p className="text-[12px] text-fg-rail">{detail.resolution.notes}</p>}
                {detail.resolution.resolvedBy && (
                  <p className="text-[11px] text-fg-rail mt-1">By: {userName(detail.resolution.resolvedBy)}</p>
                )}
              </div>
            )}

            {/* Admin notes */}
            <div>
              <p className="text-[11px] font-semibold text-fg-3 uppercase tracking-wider mb-2">
                Admin Notes {(detail.adminNotes?.length || 0) > 0 && `(${detail.adminNotes.length})`}
              </p>
              {(detail.adminNotes?.length || 0) > 0 && (
                <div className="space-y-2 mb-3">
                  {detail.adminNotes.map((note: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-canvas border border-edge">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-fg-inv">{userName(note.admin)}</span>
                        <span className="text-[10px] text-fg-rail">{format(new Date(note.createdAt), 'MMM d HH:mm')}</span>
                      </div>
                      <p className="text-[12px] text-fg-rail">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className={inputCls}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add an admin note…"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
                />
                <Button icon={Plus} onClick={handleAddNote} loading={addingNote} variant="secondary">Add</Button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Resolve modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={!!resolveModal} onClose={() => setResolveModal(null)} title={`Resolve Report`}>
        <div className="space-y-4">
          {resolveModal && (
            <div className="p-3 rounded-lg bg-canvas border border-edge text-[12px] text-fg-rail">
              Reported: <span className="text-fg-inv font-medium">{userName(resolveModal.reportedUser)}</span>
              <span className="mx-2">·</span>
              Reason: <span className="text-fg-inv font-medium capitalize">{resolveModal.reason}</span>
            </div>
          )}
          <div>
            <label className={labelCls}>Action Taken <span className="text-err normal-case">*</span></label>
            <select value={resolveData.action} onChange={e => setResolveData(d => ({ ...d, action: e.target.value }))} className={`w-full ${selectCls}`}>
              <option value="">Select action…</option>
              <option value="warning_issued">Warning Issued</option>
              <option value="content_removed">Content Removed</option>
              <option value="user_banned">User Banned</option>
              <option value="no_action">No Action Needed</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Resolution Notes</label>
            <textarea value={resolveData.notes} onChange={e => setResolveData(d => ({ ...d, notes: e.target.value }))} rows={3} className={textareaCls} placeholder="Describe what action was taken…" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={resolveData.banUser} onChange={e => setResolveData(d => ({ ...d, banUser: e.target.checked }))} className="w-4 h-4 rounded border-edge accent-accent" />
            <div>
              <span className="text-[13px] text-fg-inv font-medium">Ban reported user</span>
              <p className="text-[11px] text-fg-rail">Immediately ban {resolveModal ? userName(resolveModal.reportedUser) : 'this user'} from the platform</p>
            </div>
          </label>
          {resolveData.banUser && (
            <div className="p-3 rounded-lg bg-err/10 border border-err/20">
              <p className="text-[12px] text-err flex items-center gap-1.5"><Ban className="w-3.5 h-3.5 shrink-0" /> This will immediately ban the user. This action can be reversed from the Users page.</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <Button variant="secondary" onClick={() => setResolveModal(null)}>Cancel</Button>
            <Button variant="success" icon={CheckCircle} onClick={handleResolve} loading={resolving}>Resolve Report</Button>
          </div>
        </div>
      </Modal>

      {/* ── Dismiss modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={!!dismissModal} onClose={() => setDismissModal(null)} title="Dismiss Report">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-canvas border border-edge text-[12px] text-fg-rail">
            Dismissing report against <span className="text-fg-inv font-medium">{dismissModal ? userName(dismissModal.reportedUser) : ''}</span>. No action will be taken against the reported user.
          </div>
          <div>
            <label className={labelCls}>Reason for dismissal (optional)</label>
            <textarea value={dismissNotes} onChange={e => setDismissNotes(e.target.value)} rows={2} className={textareaCls} placeholder="e.g. Not enough evidence, false report…" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDismissModal(null)}>Cancel</Button>
            <Button variant="danger" icon={XCircle} onClick={handleDismiss} loading={dismissing}>Dismiss</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;

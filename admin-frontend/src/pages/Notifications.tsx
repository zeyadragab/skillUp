import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Send, Bell, Clock, CheckCircle, XCircle, Trash2,
  RefreshCw, Users, GraduationCap, User, AlertCircle,
  Eye, Edit3, BarChart2, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { notificationsApi } from '../services/api';
import { SystemNotification, Pagination } from '../types';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

// ── Style constants ───────────────────────────────────────────────────────────
const inputCls = 'w-full h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors';
const selectCls = 'w-full h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 focus:outline-none focus:border-edge-2 transition-colors';
const textareaCls = 'w-full px-3 py-2.5 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors resize-none';
const labelCls = 'block text-[11px] font-semibold text-fg-3 uppercase tracking-wider mb-1.5';

// ── Helpers ───────────────────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  info:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-ok/10 text-ok border-ok/20',
  warning: 'bg-warn/10 text-warn border-warn/20',
  error:   'bg-err/10 text-err border-err/20',
};

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  sent:      'success',
  active:    'info',
  scheduled: 'warning',
  cancelled: 'error',
  draft:     'default',
};

const TARGET_ICON: Record<string, React.ReactNode> = {
  all:      <Users className="w-3.5 h-3.5" />,
  teachers: <GraduationCap className="w-3.5 h-3.5" />,
  learners: <User className="w-3.5 h-3.5" />,
  specific: <User className="w-3.5 h-3.5" />,
};

function readRate(notif: SystemNotification): number {
  const d = notif.stats?.delivered || 0;
  const r = notif.stats?.read || 0;
  return d > 0 ? Math.round((r / d) * 100) : 0;
}

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

// ── Empty form state ──────────────────────────────────────────────────────────
const EMPTY_FORM = { title: '', message: '', type: 'info', targetAudience: 'all', priority: 'normal', scheduledAt: '' };

// ── Main component ────────────────────────────────────────────────────────────
const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, pages: 0 });
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<SystemNotification | null>(null);
  const [detailModal, setDetailModal] = useState<SystemNotification | null>(null);
  const [deleteModal, setDeleteModal] = useState<SystemNotification | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const setF = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notifRes, statsRes] = await Promise.allSettled([
        notificationsApi.getNotifications({
          page: pagination.page,
          limit: pagination.limit,
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { type: typeFilter }),
        }),
        notificationsApi.getStats(),
      ]);
      if (notifRes.status === 'fulfilled') {
        setNotifications(notifRes.value.data.data || []);
        setPagination(p => ({ ...p, ...notifRes.value.data.pagination }));
      }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
    } catch (e: any) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) { toast.error('Title and message are required'); return; }
    setSubmitting(true);
    try {
      const payload: any = { ...form };
      if (!payload.scheduledAt) delete payload.scheduledAt;
      await notificationsApi.createNotification(payload);
      toast.success('Notification created');
      setCreateModal(false);
      setForm({ ...EMPTY_FORM });
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editModal) return;
    if (!form.title.trim() || !form.message.trim()) { toast.error('Title and message are required'); return; }
    setSubmitting(true);
    try {
      const payload: any = { ...form };
      if (!payload.scheduledAt) delete payload.scheduledAt;
      await notificationsApi.updateNotification(editModal._id, payload);
      toast.success('Notification updated');
      setEditModal(null);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSend = async (notif: SystemNotification) => {
    try {
      const res = await notificationsApi.sendNotification(notif._id);
      toast.success(res.data.message || 'Sent');
      // Optimistic update
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, status: 'sent', sentAt: new Date().toISOString() } : n));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to send');
    }
  };

  const handleCancel = async (notif: SystemNotification) => {
    try {
      await notificationsApi.cancelNotification(notif._id);
      toast.success('Cancelled');
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, status: 'cancelled' } : n));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setSubmitting(true);
    try {
      await notificationsApi.deleteNotification(deleteModal._id);
      toast.success('Deleted');
      setDeleteModal(null);
      setNotifications(prev => prev.filter(n => n._id !== deleteModal._id));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (notif: SystemNotification) => {
    setForm({
      title: notif.title,
      message: notif.message,
      type: notif.type,
      targetAudience: notif.targetAudience,
      priority: notif.priority,
      scheduledAt: notif.scheduledAt ? notif.scheduledAt.slice(0, 16) : '',
    });
    setEditModal(notif);
  };

  // ── Form fields (shared between create / edit) ─────────────────────────────
  const FormFields = () => (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Title <span className="text-err normal-case">*</span></label>
        <input className={inputCls} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Notification title…" />
      </div>
      <div>
        <label className={labelCls}>Message <span className="text-err normal-case">*</span></label>
        <textarea className={textareaCls} rows={4} value={form.message} onChange={e => setF('message', e.target.value)} placeholder="Notification body…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Type</label>
          <select className={selectCls} value={form.type} onChange={e => setF('type', e.target.value)}>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <select className={selectCls} value={form.priority} onChange={e => setF('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Target Audience</label>
          <select className={selectCls} value={form.targetAudience} onChange={e => setF('targetAudience', e.target.value)}>
            <option value="all">All Users</option>
            <option value="teachers">Teachers Only</option>
            <option value="learners">Learners Only</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Schedule (optional)</label>
          <input type="datetime-local" className={inputCls} value={form.scheduledAt} onChange={e => setF('scheduledAt', e.target.value)} />
        </div>
      </div>
      {/* Live preview */}
      {(form.title || form.message) && (
        <div className={`p-3 rounded-lg border ${TYPE_COLOR[form.type] || TYPE_COLOR.info}`}>
          <p className="text-[12px] font-semibold mb-0.5">{form.title || 'Untitled'}</p>
          <p className="text-[11px] opacity-80">{form.message || '…'}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-5 space-y-5">

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Mini label="Total" value={stats?.totalNotifications || 0} icon={<Bell className="w-4 h-4" />} color="text-accent" />
        <Mini label="Sent" value={stats?.sentNotifications || 0} icon={<CheckCircle className="w-4 h-4" />} color="text-ok" />
        <Mini label="Scheduled" value={stats?.scheduledNotifications || 0} icon={<Clock className="w-4 h-4" />} color="text-warn" />
        <Mini label="Active" value={stats?.activeNotifications || 0} icon={<Bell className="w-4 h-4" />} color="text-blue-400" />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="bg-panel border border-edge rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-fg-3">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-[12px] font-medium">Filters</span>
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          className="h-8 px-2.5 bg-canvas border border-edge rounded-lg text-[12px] text-fg-1 focus:outline-none focus:border-edge-2"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="sent">Sent</option>
          <option value="scheduled">Scheduled</option>
          <option value="cancelled">Cancelled</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          className="h-8 px-2.5 bg-canvas border border-edge rounded-lg text-[12px] text-fg-1 focus:outline-none focus:border-edge-2"
        >
          <option value="">All Types</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <button onClick={fetchData} className="p-1.5 rounded-lg text-fg-3 hover:text-fg-1 hover:bg-canvas border border-edge transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1" />
        <Button icon={Plus} onClick={() => { setForm({ ...EMPTY_FORM }); setCreateModal(true); }}>
          Create Notification
        </Button>
      </div>

      {/* ── Notification list ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/5 bg-rail overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[72px] bg-canvas animate-pulse border-b border-white/5 last:border-0" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-fg-rail">
            <Bell className="w-8 h-8 opacity-30" />
            <p className="text-[13px]">No notifications found</p>
            <Button variant="secondary" icon={Plus} onClick={() => setCreateModal(true)}>Create one</Button>
          </div>
        ) : (
          <div>
            {notifications.map((notif, i) => {
              const rate = readRate(notif);
              const canSend = notif.status !== 'sent' && notif.status !== 'cancelled';
              const canEdit = notif.status !== 'sent';
              return (
                <div
                  key={notif._id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors ${i < notifications.length - 1 ? 'border-b border-white/4' : ''}`.trim()}
                >
                  {/* Type indicator */}
                  <div className={`w-1 h-10 rounded-full shrink-0 ${
                    notif.type === 'success' ? 'bg-ok' :
                    notif.type === 'warning' ? 'bg-warn' :
                    notif.type === 'error' ? 'bg-err' : 'bg-blue-400'
                  }`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-fg-inv truncate">{notif.title}</p>
                      <Badge variant={STATUS_VARIANT[notif.status] || 'default'}>{notif.status}</Badge>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize ${TYPE_COLOR[notif.type] || TYPE_COLOR.info}`}>
                        {notif.type}
                      </span>
                      {notif.priority === 'high' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-err/10 border border-err/20 text-err">HIGH</span>
                      )}
                    </div>
                    <p className="text-[12px] text-fg-rail truncate mt-0.5">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px] text-fg-rail">
                      <span className="flex items-center gap-1">{TARGET_ICON[notif.targetAudience]} {notif.targetAudience}</span>
                      {notif.stats?.totalTargeted > 0 && (
                        <span className="flex items-center gap-1">
                          <BarChart2 className="w-3 h-3" />
                          {notif.stats.delivered}/{notif.stats.totalTargeted} delivered · {rate}% read
                        </span>
                      )}
                      <span>{format(new Date(notif.createdAt), 'MMM d, yyyy HH:mm')}</span>
                      {notif.scheduledAt && notif.status === 'scheduled' && (
                        <span className="text-warn">Scheduled: {format(new Date(notif.scheduledAt), 'MMM d HH:mm')}</span>
                      )}
                      {notif.sentAt && (
                        <span className="text-ok">Sent: {format(new Date(notif.sentAt), 'MMM d HH:mm')}</span>
                      )}
                    </div>
                    {/* Read-rate bar for sent notifications */}
                    {notif.status === 'sent' && notif.stats?.delivered > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-rail-hi overflow-hidden">
                          <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-[10px] text-fg-rail shrink-0">{rate}% read</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setDetailModal(notif)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-fg-rail hover:text-fg-inv hover:bg-white/5 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => openEdit(notif)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-fg-rail hover:text-fg-inv hover:bg-white/5 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canSend && (
                      <button
                        onClick={() => handleSend(notif)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-ok/70 hover:text-ok hover:bg-ok/10 transition-colors"
                        title="Send now"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {notif.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancel(notif)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-fg-rail hover:text-warn hover:bg-warn/10 transition-colors"
                        title="Cancel"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteModal(notif)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-fg-rail hover:text-err hover:bg-err/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
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
                  className={`w-7 h-7 rounded-md text-[12px] font-medium transition-colors ${
                    p === pagination.page
                      ? 'bg-accent text-[oklch(15%_0.008_55)]'
                      : 'text-fg-rail hover:text-fg-inv hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Create modal ──────────────────────────────────────────────────── */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Notification" size="lg">
        <div className="space-y-5">
          <FormFields />
          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button icon={Plus} onClick={handleCreate} loading={submitting}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={`Edit: ${editModal?.title}`} size="lg">
        <div className="space-y-5">
          <FormFields />
          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button icon={Edit3} onClick={handleEdit} loading={submitting}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* ── Detail drawer ─────────────────────────────────────────────────── */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Notification Details" size="lg">
        {detailModal && (() => {
          const rate = readRate(detailModal);
          return (
            <div className="space-y-4">
              {/* Preview */}
              <div className={`p-4 rounded-xl border ${TYPE_COLOR[detailModal.type] || TYPE_COLOR.info}`}>
                <p className="text-[14px] font-bold mb-1">{detailModal.title}</p>
                <p className="text-[13px] opacity-80">{detailModal.message}</p>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Status', value: <Badge variant={STATUS_VARIANT[detailModal.status] || 'default'}>{detailModal.status}</Badge> },
                  { label: 'Type', value: <span className="capitalize text-[13px] text-fg-1">{detailModal.type}</span> },
                  { label: 'Priority', value: <span className="capitalize text-[13px] text-fg-1">{detailModal.priority}</span> },
                  { label: 'Target', value: <span className="capitalize text-[13px] text-fg-1">{detailModal.targetAudience}</span> },
                  { label: 'Created', value: <span className="text-[13px] text-fg-1">{format(new Date(detailModal.createdAt), 'MMM d, yyyy HH:mm')}</span> },
                  { label: 'Sent At', value: <span className="text-[13px] text-fg-1">{detailModal.sentAt ? format(new Date(detailModal.sentAt), 'MMM d, yyyy HH:mm') : '—'}</span> },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg bg-canvas border border-edge">
                    <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-wider mb-1">{label}</p>
                    {value}
                  </div>
                ))}
              </div>

              {/* Delivery stats */}
              <div className="p-4 rounded-xl border border-white/5 bg-canvas">
                <p className="text-[12px] font-semibold text-fg-rail uppercase tracking-wider mb-3">Delivery Statistics</p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: 'Targeted', value: detailModal.stats?.totalTargeted || 0, color: 'text-fg-inv' },
                    { label: 'Delivered', value: detailModal.stats?.delivered || 0, color: 'text-ok' },
                    { label: 'Read', value: detailModal.stats?.read || 0, color: 'text-accent' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`text-[24px] font-bold ${color}`}>{value.toLocaleString()}</p>
                      <p className="text-[11px] text-fg-rail">{label}</p>
                    </div>
                  ))}
                </div>
                {detailModal.stats?.delivered > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-fg-rail">Read rate</span>
                      <span className="text-[12px] font-bold text-accent">{rate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-rail-hi overflow-hidden">
                      <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${rate}%` }} />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                {detailModal.status !== 'sent' && detailModal.status !== 'cancelled' && (
                  <Button icon={Send} variant="success" onClick={() => { handleSend(detailModal); setDetailModal(null); }}>
                    Send Now
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setDetailModal(null)}>Close</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Delete confirm modal ──────────────────────────────────────────── */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Notification">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-err/10 border border-err/20">
            <p className="text-[13px] text-err font-medium">This action cannot be undone.</p>
            <p className="text-[12px] text-fg-rail mt-1">
              Delete <strong className="text-fg-inv">{deleteModal?.title}</strong>?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete} loading={submitting}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notifications;

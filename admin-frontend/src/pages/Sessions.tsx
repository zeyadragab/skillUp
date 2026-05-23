import React, { useEffect, useState } from 'react';
import { XCircle, Calendar, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import StatsCard from '../components/common/StatsCard';
import { sessionsApi } from '../services/api';
import { Session, Pagination } from '../types';
import { format } from 'date-fns';

const selectCls = 'h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 focus:outline-none focus:border-edge-2 transition-colors';
const textareaCls = 'w-full px-3 py-2.5 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors resize-none';
const labelCls = 'block text-[12px] font-medium text-fg-2 mb-1.5';

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelModal, setCancelModal] = useState<Session | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { fetchData(); }, [pagination.page, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        sessionsApi.getSessions({ page: pagination.page, limit: pagination.limit, status: statusFilter || undefined }),
        sessionsApi.getStats(),
      ]);
      setSessions(sessionsRes.data.data || []);
      setPagination(sessionsRes.data.pagination);
      setStats(statsRes.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      await sessionsApi.cancelSession(cancelModal._id, cancelReason);
      toast.success('Session cancelled');
      fetchData();
      setCancelModal(null);
      setCancelReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel session');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success' as const;
      case 'confirmed': return 'info' as const;
      case 'cancelled': return 'error' as const;
      default: return 'warning' as const;
    }
  };

  const columns = [
    {
      key: 'participants',
      header: 'Participants',
      className: 'w-[22%]',
      render: (session: Session) => (
        <div>
          <p className="text-[13px] font-medium text-fg-1">{typeof session.teacher === 'object' ? session.teacher.name : 'Teacher'}</p>
          <p className="text-[11px] text-fg-3">with {typeof session.learner === 'object' ? session.learner.name : 'Learner'}</p>
        </div>
      ),
    },
    {
      key: 'skill',
      header: 'Skill',
      className: 'w-[16%]',
      render: (session: Session) => (
        <Badge variant="info">{typeof session.skill === 'object' ? session.skill.name : session.skill}</Badge>
      ),
    },
    {
      key: 'scheduledAt',
      header: 'Scheduled',
      className: 'w-[20%]',
      render: (session: Session) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-fg-3" />
          <span className="text-[12px] text-fg-2">{session.scheduledAt ? format(new Date(session.scheduledAt), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      className: 'w-[12%]',
      render: (session: Session) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-fg-3" />
          <span className="text-[13px] text-fg-2">{session.duration} min</span>
        </div>
      ),
    },
    {
      key: 'tokens',
      header: 'Tokens',
      className: 'w-[10%]',
      render: (session: Session) => <span className="text-[13px] font-medium text-fg-1">{(session as any).tokenAmount ?? session.tokensExchanged ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[12%]',
      render: (session: Session) => <Badge variant={getStatusVariant(session.status)}>{session.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[8%]',
      render: (session: Session) =>
        session.status !== 'cancelled' && session.status !== 'completed' ? (
          <Button variant="danger" size="sm" icon={XCircle} onClick={(e) => { e.stopPropagation(); setCancelModal(session); }} />
        ) : null,
    },
  ];

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Sessions" value={stats?.totalSessions || 0} icon={Calendar} color="blue" />
        <StatsCard title="Completed" value={stats?.completedSessions || 0} icon={CheckCircle} color="green" />
        <StatsCard title="Pending" value={stats?.pendingSessions || 0} icon={Clock} color="yellow" />
        <StatsCard title="Cancelled" value={stats?.cancelledSessions || 0} icon={XCircle} color="red" />
      </div>

      <div className="bg-panel border border-edge rounded-xl overflow-hidden">
        <div className="p-4 border-b border-edge">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <DataTable
          columns={columns}
          data={sessions}
          loading={loading}
          pagination={{ ...pagination, onPageChange: (page) => setPagination((prev) => ({ ...prev, page })) }}
        />
      </div>

      <Modal isOpen={!!cancelModal} onClose={() => { setCancelModal(null); setCancelReason(''); }} title="Cancel Session">
        <div className="space-y-4">
          <p className="text-[13px] text-fg-2">Are you sure you want to cancel this session?</p>
          <div>
            <label className={labelCls}>Reason for cancellation</label>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} className={textareaCls} placeholder="Enter reason..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCancelModal(null)}>Keep Session</Button>
            <Button variant="danger" onClick={handleCancel}>Cancel Session</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sessions;

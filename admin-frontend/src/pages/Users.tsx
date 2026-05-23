import React, { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle, Coins, Eye, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { usersApi } from '../services/api';
import { User, Pagination } from '../types';
import { format } from 'date-fns';

const inputCls = 'w-full h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors';
const selectCls = 'h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 focus:outline-none focus:border-edge-2 transition-colors';
const textareaCls = 'w-full px-3 py-2.5 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors resize-none';
const labelCls = 'block text-[12px] font-medium text-fg-2 mb-1.5';

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionModal, setActionModal] = useState<{ type: string; user: User } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [tokenAmount, setTokenAmount] = useState(0);
  const [tokenType, setTokenType] = useState<'credit' | 'debit'>('credit');
  const [submitting, setSubmitting] = useState(false);
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [verifyAllModal, setVerifyAllModal] = useState(false);
  const [unverifiedCount, setUnverifiedCount] = useState<number | null>(null);

  useEffect(() => { fetchUsers(); }, [pagination.page, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getUsers({ page: pagination.page, limit: pagination.limit, search, role: roleFilter || undefined });
      setUsers(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!actionModal?.user || !actionReason.trim()) {
      toast.error('Please enter a reason');
      return;
    }
    setSubmitting(true);
    try {
      await usersApi.banUser(actionModal.user._id, actionReason);
      toast.success(`${actionModal.user.name} has been banned`);
      fetchUsers();
      setActionModal(null);
      setActionReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnbanUser = async (user: User) => {
    try {
      await usersApi.unbanUser(user._id);
      toast.success(`${user.name} has been unbanned`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unban user');
    }
  };

  const handleVerifyAll = async () => {
    setVerifyingAll(true);
    try {
      const res = await usersApi.verifyAll();
      toast.success(res.data.message);
      setVerifyAllModal(false);
      setUnverifiedCount(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify users');
    } finally {
      setVerifyingAll(false);
    }
  };

  const handleAdjustTokens = async () => {
    if (!actionModal?.user) return;
    if (!tokenAmount || tokenAmount <= 0) {
      toast.error('Enter a valid amount greater than 0');
      return;
    }
    setSubmitting(true);
    try {
      await usersApi.adjustTokens(actionModal.user._id, tokenAmount, tokenType, actionReason);
      toast.success(`${tokenType === 'credit' ? 'Added' : 'Removed'} ${tokenAmount} tokens ${tokenType === 'credit' ? 'to' : 'from'} ${actionModal.user.name}`);
      fetchUsers();
      setActionModal(null);
      setActionReason('');
      setTokenAmount(0);
      setTokenType('credit');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to adjust tokens');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      className: 'w-[28%]',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center text-accent text-[12px] font-bold shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-fg-1 truncate">{user.name}</p>
            <p className="text-[11px] text-fg-3 truncate">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      className: 'w-[12%]',
      render: (user: User) => (
        <Badge variant={user.role === 'teacher' ? 'success' : 'info'}>{user.role}</Badge>
      ),
    },
    {
      key: 'tokens',
      header: 'Tokens',
      className: 'w-[12%]',
      render: (user: User) => (
        <span className="text-[13px] font-medium text-fg-1">{(user.tokens ?? 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[12%]',
      render: (user: User) => (
        <Badge variant={user.isBanned ? 'error' : user.isActive ? 'success' : 'warning'}>
          {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      className: 'w-[14%]',
      render: (user: User) => (
        <span className="text-[12px] text-fg-3">
          {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[22%]',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Eye} onClick={(e) => { e.stopPropagation(); navigate(`/users/${user._id}`); }}>
            View
          </Button>
          {user.isBanned ? (
            <Button variant="success" size="sm" icon={CheckCircle} onClick={(e) => { e.stopPropagation(); handleUnbanUser(user); }}>
              Unban
            </Button>
          ) : (
            <Button variant="danger" size="sm" icon={Ban} onClick={(e) => { e.stopPropagation(); setActionModal({ type: 'ban', user }); }}>
              Ban
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={Coins} onClick={(e) => { e.stopPropagation(); setTokenType('credit'); setActionModal({ type: 'tokens', user }); }}>
            Tokens
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-5 space-y-4">
      <div className="bg-panel border border-edge rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-3 pointer-events-none" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputCls} pl-9`} />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectCls}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <Button variant="success" icon={ShieldCheck} onClick={async () => {
            setVerifyAllModal(true);
            try {
              const res = await usersApi.getUsers({ isVerified: false, limit: 1 });
              setUnverifiedCount(res.data.pagination?.total ?? null);
            } catch { setUnverifiedCount(null); }
          }}>
            Verify All
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onRowClick={(user) => navigate(`/users/${user._id}`)}
        pagination={{ ...pagination, onPageChange: (page) => setPagination((prev) => ({ ...prev, page })) }}
      />

      {/* Verify All Modal */}
      <Modal isOpen={verifyAllModal} onClose={() => { setVerifyAllModal(false); setUnverifiedCount(null); }} title="Verify All Users">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-ok/10 border border-ok/20">
            <p className="text-[13px] text-ok font-medium">
              {unverifiedCount === null
                ? 'Loading…'
                : unverifiedCount === 0
                  ? 'All users are already verified.'
                  : `This will verify ${unverifiedCount} unverified user${unverifiedCount !== 1 ? 's' : ''} on the platform.`}
            </p>
            <p className="text-[12px] text-fg-3 mt-1">All users without verification will be marked as verified instantly.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setVerifyAllModal(false); setUnverifiedCount(null); }}>Cancel</Button>
            <Button variant="success" icon={ShieldCheck} onClick={handleVerifyAll} loading={verifyingAll} disabled={unverifiedCount === 0}>
              {unverifiedCount === 0 ? 'Nothing to verify' : 'Verify All'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ban Modal */}
      <Modal isOpen={actionModal?.type === 'ban'} onClose={() => { setActionModal(null); setActionReason(''); }} title={`Ban: ${actionModal?.user?.name}`}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Reason for ban <span className="text-err">*</span></label>
            <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} rows={3} className={textareaCls} placeholder="Enter reason..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleBanUser} loading={submitting}>Ban User</Button>
          </div>
        </div>
      </Modal>

      {/* Tokens Modal */}
      <Modal isOpen={actionModal?.type === 'tokens'} onClose={() => { setActionModal(null); setActionReason(''); setTokenAmount(0); setTokenType('credit'); }} title={`Adjust Tokens: ${actionModal?.user?.name}`}>
        <div className="space-y-4">
          <div className="p-3 bg-canvas rounded-lg border border-edge">
            <p className="text-[11px] text-fg-3 uppercase tracking-widest mb-0.5">Current Balance</p>
            <p className="text-[20px] font-semibold text-fg-1">{(actionModal?.user?.tokens ?? 0).toLocaleString()} <span className="text-[13px] text-fg-3 font-normal">tokens</span></p>
          </div>

          <div>
            <label className={labelCls}>Operation</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTokenType('credit')}
                className={`h-9 rounded-lg text-[13px] font-medium transition-colors border ${tokenType === 'credit' ? 'bg-ok-bg text-ok border-ok/30' : 'bg-canvas text-fg-3 border-edge hover:text-fg-1'}`}
              >
                + Add Tokens
              </button>
              <button
                onClick={() => setTokenType('debit')}
                className={`h-9 rounded-lg text-[13px] font-medium transition-colors border ${tokenType === 'debit' ? 'bg-err-bg text-err border-err/30' : 'bg-canvas text-fg-3 border-edge hover:text-fg-1'}`}
              >
                - Remove Tokens
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Amount</label>
            <input type="number" min="1" value={tokenAmount || ''} onChange={(e) => setTokenAmount(parseInt(e.target.value) || 0)} className={inputCls} placeholder="Enter amount..." />
          </div>

          <div>
            <label className={labelCls}>Reason</label>
            <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} rows={2} className={textareaCls} placeholder="Enter reason..." />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button variant={tokenType === 'credit' ? 'success' : 'danger'} onClick={handleAdjustTokens} loading={submitting}>
              {tokenType === 'credit' ? 'Add' : 'Remove'} {tokenAmount > 0 ? tokenAmount : ''} Tokens
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;

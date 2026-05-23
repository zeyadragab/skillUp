import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import StatsCard from '../components/common/StatsCard';
import { transactionsApi } from '../services/api';
import { Transaction, Pagination } from '../types';
import { format } from 'date-fns';

const selectCls = 'h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 focus:outline-none focus:border-edge-2 transition-colors';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border border-edge rounded-lg px-3 py-2.5" style={{ boxShadow: '0 8px 24px oklch(0% 0 0 / 0.4)' }}>
      <p className="text-[11px] text-fg-3 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-[12px] font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [typeFilter, setTypeFilter] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [circulationData, setCirculationData] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, [pagination.page, typeFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, statsRes, circRes] = await Promise.all([
        transactionsApi.getTransactions({ page: pagination.page, limit: pagination.limit, type: typeFilter || undefined }),
        transactionsApi.getStats(),
        transactionsApi.getCirculation(),
      ]);
      setTransactions(transRes.data.data || []);
      setPagination(transRes.data.pagination);
      setStats(statsRes.data.data);
      setCirculationData(circRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      className: 'w-[22%]',
      render: (tx: Transaction) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-note-bg rounded-lg flex items-center justify-center text-note text-[12px] font-bold flex-shrink-0">
            {typeof tx.user === 'object' ? tx.user.name?.charAt(0)?.toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-[13px] font-medium text-fg-1">{typeof tx.user === 'object' ? tx.user.name : 'User'}</p>
            <p className="text-[11px] text-fg-3">{typeof tx.user === 'object' ? tx.user.email : ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      className: 'w-[12%]',
      render: (tx: Transaction) => (
        <div className="flex items-center gap-1.5">
          {tx.type === 'credit' ? <ArrowDownLeft className="w-3.5 h-3.5 text-ok" /> : <ArrowUpRight className="w-3.5 h-3.5 text-err" />}
          <Badge variant={tx.type === 'credit' ? 'success' : 'error'}>{tx.type}</Badge>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'w-[12%]',
      render: (tx: Transaction) => (
        <span className={`text-[13px] font-semibold ${tx.type === 'credit' ? 'text-ok' : 'text-err'}`}>
          {tx.type === 'credit' ? '+' : '-'}{tx.amount}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      className: 'w-[16%]',
      render: (tx: Transaction) => (
        <span className="text-[12px] text-fg-2">{tx.balanceBefore} → {tx.balanceAfter}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      className: 'w-[22%]',
      render: (tx: Transaction) => (
        <span className="text-[12px] text-fg-3 truncate block">{tx.reason}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      className: 'w-[16%]',
      render: (tx: Transaction) => (
        <span className="text-[12px] text-fg-3">{format(new Date(tx.createdAt), 'MMM d, yyyy h:mm a')}</span>
      ),
    },
  ];

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Transactions" value={stats?.totalTransactions || 0} icon={Coins} color="blue" />
        <StatsCard title="Tokens Credited" value={stats?.totalCredits || 0} icon={TrendingUp} color="green" />
        <StatsCard title="Tokens Debited" value={stats?.totalDebits || 0} icon={TrendingDown} color="red" />
        <StatsCard title="Net Circulation" value={stats?.netCirculation || 0} icon={Coins} color="purple" />
      </div>

      {circulationData.length > 0 && (
        <div className="bg-panel border border-edge rounded-xl p-5">
          <p className="text-[13px] font-semibold text-fg-1 mb-4">Token Circulation</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={circulationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(28% 0.015 260)" />
                <XAxis dataKey="date" stroke="oklch(46% 0.008 260)" fontSize={11} tickLine={false} />
                <YAxis stroke="oklch(46% 0.008 260)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="credits" stroke="oklch(60% 0.18 145)" strokeWidth={2} dot={false} name="Credits" />
                <Line type="monotone" dataKey="debits" stroke="oklch(63% 0.20 25)" strokeWidth={2} dot={false} name="Debits" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-panel border border-edge rounded-xl overflow-hidden">
        <div className="p-4 border-b border-edge">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          pagination={{ ...pagination, onPageChange: (page) => setPagination((prev) => ({ ...prev, page })) }}
        />
      </div>
    </div>
  );
};

export default Transactions;

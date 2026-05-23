import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'teal';
}

const colorClasses: Record<string, string> = {
  blue:   'bg-note-bg text-note',
  green:  'bg-ok-bg text-ok',
  yellow: 'bg-warn-bg text-warn',
  red:    'bg-err-bg text-err',
  purple: 'bg-note-bg text-note',
  teal:   'bg-ok-bg text-ok',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color = 'teal' }) => (
  <div className="bg-panel border border-edge rounded-xl p-5 hover:border-edge-2 transition-colors">
    <div className="flex items-start justify-between">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${trend.isPositive ? 'text-ok' : 'text-err'}`}>
          {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend.value}%
        </div>
      )}
    </div>
    <div className="mt-3.5">
      <p className="text-[22px] font-semibold text-fg-1 leading-none">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-[12px] text-fg-3 mt-1">{title}</p>
    </div>
  </div>
);

export default StatsCard;

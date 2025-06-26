import { CheckCircle, CircleOff, AlertTriangle, Loader } from 'lucide-react';
import React from 'react';

export interface VpnStatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'pending';
}

const map = {
  online: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    Icon: CheckCircle
  },
  offline: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    Icon: CircleOff
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    Icon: AlertTriangle
  },
  pending: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    Icon: Loader
  }
} as const;

const VpnStatusBadge: React.FC<VpnStatusBadgeProps> = ({ status }) => {
  const { bg, text, Icon } = map[status];
  const extra = status === 'pending' ? 'animate-pulse' : '';
  const iconClasses = status === 'pending' ? 'w-4 h-4 animate-spin' : 'w-4 h-4';
  return (
    <span
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm font-medium ${bg} ${text} ${extra}`}
    >
      <Icon className={iconClasses} />
      {status}
    </span>
  );
};

export default VpnStatusBadge;

import React, { useState } from 'react';
import { RotateCcw, Loader } from 'lucide-react';
import VpnStatusBadge from './VpnStatusBadge';
import { Vpn, VpnStatus } from '../types/vpn';

interface VpnCardProps {
  vpn: Vpn;
  jwt: string;
}

const VpnCard: React.FC<VpnCardProps> = ({ vpn, jwt }) => {
  const [status, setStatus] = useState<VpnStatus>(vpn.status);
  const [loading, setLoading] = useState(false);

  const handleRestart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vpn/restart/' + vpn.id, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + jwt }
      });
      if (res.ok) {
        setStatus('pending');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {vpn.name}
          <VpnStatusBadge status={status} />
        </h3>
      </div>
      <button
        className="btn-primary flex items-center gap-1"
        onClick={handleRestart}
        disabled={loading}
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <RotateCcw className="w-4 h-4" />
        )}
        Restart
      </button>
    </div>
  );
};

export default VpnCard;

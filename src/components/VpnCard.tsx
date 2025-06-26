import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import VpnStatusBadge from './VpnStatusBadge';
import { Vpn, VpnStatus } from '../types/vpn';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTranslation } from 'react-i18next';

interface VpnCardProps {
  vpn: Vpn;
  jwt: string;
}

const VpnCard: React.FC<VpnCardProps> = ({ vpn, jwt }) => {
  const { t } = useTranslation('common');
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
    <Card className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {vpn.name}
          <VpnStatusBadge status={status} />
        </h3>
      </div>
      <Button onClick={handleRestart} isLoading={loading} className="gap-1">
        <RotateCcw className="w-4 h-4" />
        {t('button.restart')}
      </Button>
    </Card>
  );
};

export default VpnCard;

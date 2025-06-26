export type VpnStatus = 'online' | 'offline' | 'warning' | 'pending';

export interface Vpn {
  id: string;
  name: string;
  status: VpnStatus;
  createdAt: string;
}

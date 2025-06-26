export interface Vpn {
  id: string;
  ownerId: string;
  name: string;
}

export type JobStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Job {
  id: string;
  vpnId: string;
  status: JobStatus;
}

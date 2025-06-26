import { Job, Vpn } from './types';

export const vpns: Vpn[] = [
  { id: '1', ownerId: 'u1', name: 'First VPN' },
  { id: '2', ownerId: 'u2', name: 'Second VPN' }
];

export const jobs: Job[] = [];

export function createJob(vpnId: string): Job {
  const id = String(jobs.length + 1);
  const job: Job = { id, vpnId, status: 'PENDING' };
  jobs.push(job);
  return job;
}

export function updateJob(id: string, status: Job['status']): void {
  const job = jobs.find(j => j.id === id);
  if (job) job.status = status;
}

export function findVpn(id: string): Vpn | undefined {
  return vpns.find(v => v.id === id);
}

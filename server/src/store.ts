import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Job, Role, User, Vpn } from './types';

export const users: User[] = [
  {
    id: 'u1',
    uuid: 'uuid-u1',
    email: 'admin@test.com',
    password: bcrypt.hashSync('admin', 8),
    role: Role.ADMIN
  },
  {
    id: 'u2',
    uuid: 'uuid-u2',
    email: 'user@test.com',
    password: bcrypt.hashSync('user', 8),
    role: Role.USER
  },
  {
    id: 'u3',
    uuid: 'uuid-u3',
    email: 'viewer@test.com',
    password: bcrypt.hashSync('viewer', 8),
    role: Role.VIEWER
  }
];

export const vpns: Vpn[] = [
  { id: '1', ownerId: 'u1', name: 'First VPN', tariffId: 't1' },
  { id: '2', ownerId: 'u2', name: 'Second VPN', tariffId: 't2' }
];

export const subscriptions: Record<string, { status: string }> = {
  u1: { status: 'inactive' },
  u2: { status: 'inactive' },
  u3: { status: 'inactive' }
};

export let configTemplate: any = {
  v: '2',
  ps: 'My-VPN',
  add: 'vpn.example.com',
  port: 443,
  id: '{{USER_UUID}}',
  aid: 0,
  scy: 'auto',
  net: 'tcp',
  type: 'none',
  host: '',
  path: '',
  tls: 'tls'
};

const templatePath = path.join(__dirname, '../config-template.json');
if (fs.existsSync(templatePath)) {
  configTemplate = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
} else {
  fs.writeFileSync(templatePath, JSON.stringify(configTemplate, null, 2));
}

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

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function createVpn(data: Omit<Vpn, 'id'>): Vpn {
  const id = String(vpns.length + 1);
  const vpn: Vpn = { id, ...data };
  vpns.push(vpn);
  return vpn;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
}

export interface Vpn {
  id: string;
  ownerId: string;
  name: string;
  tariffId: string;
}

export type JobStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Job {
  id: string;
  vpnId: string;
  status: JobStatus;
}

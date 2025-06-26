export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  email: string;
  password: string;
  uuid: string;
  role: Role;
  subscription?: Subscription;
}

export interface Subscription {
  status: string;
  stripeId?: string;
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

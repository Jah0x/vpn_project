export interface User {
  id: string;
  email: string;
  nickname?: string;
  role?: string;
  [key: string]: any;
}

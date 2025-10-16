export type UserRole = 'customer' | 'admin' | 'employee';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  rewards: { id: string; name: string; date: string }[];
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  product: 'Sushi' | 'Fresh Fish' | 'Other';
  details: string;
  date: string;
  status: 'pending' | 'ready' | 'collected';
};

export type Activity = {
  day: string;
  stamps: number;
};

export type SessionPayload = {
  userId: string;
  role: UserRole;
  expiresAt: Date;
};

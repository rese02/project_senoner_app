import type { User, Order, Activity } from './types';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Alice',
    email: 'customer@example.com',
    role: 'customer',
    points: 7,
    rewards: [
      { id: 'reward-1', name: 'Free Coffee', date: '2023-05-10' },
    ],
  },
  {
    id: 'user-2',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    points: 0,
    rewards: [],
  },
  {
    id: 'user-3',
    name: 'Employee',
    email: 'employee@example.com',
    role: 'employee',
    points: 0,
    rewards: [],
  },
  {
    id: 'user-4',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'customer',
    points: 3,
    rewards: [],
  },
];

export const orders: Order[] = [
  {
    id: 'order-1',
    customerId: 'user-1',
    customerName: 'Alice',
    product: 'Sushi',
    details: '2x Salmon Nigiri, 1x Tuna Roll',
    date: '2024-07-28',
    status: 'ready',
  },
  {
    id: 'order-2',
    customerId: 'user-4',
    customerName: 'Bob',
    product: 'Fresh Fish',
    details: '1kg Cod Fillet',
    date: '2024-07-28',
    status: 'pending',
  },
  {
    id: 'order-3',
    customerId: 'user-1',
    customerName: 'Alice',
    product: 'Sushi',
    details: 'Deluxe Platter',
    date: '2024-07-27',
    status: 'collected',
  },
  {
    id: 'order-4',
    customerId: 'user-4',
    customerName: 'Bob',
    product: 'Other',
    details: 'Gourmet Cheese Selection',
    date: '2024-07-26',
    status: 'collected',
  },
];

export const activity: Activity[] = [
  { day: 'Mon', stamps: 12 },
  { day: 'Tue', stamps: 18 },
  { day: 'Wed', stamps: 8 },
  { day: 'Thu', stamps: 22 },
  { day: 'Fri', stamps: 31 },
  { day: 'Sat', stamps: 45 },
  { day: 'Sun', stamps: 38 },
];

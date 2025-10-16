import type { User, Order, Activity, Category } from './types';

// This file is now deprecated for holding user, order, and category data.
// This data is now stored and retrieved from Firestore.
// The mock data is kept here for reference or potential testing purposes.

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

export const categories: Category[] = [
    {
        id: 'cat-1',
        name: 'Frischer Fisch',
        image: 'https://picsum.photos/seed/fish/600/400',
        imageHint: 'fresh fish',
        pickupDays: ['Tue', 'Fri'],
        products: [
            {
                id: 'prod-1-1',
                name: 'Barsch',
                image: 'https://picsum.photos/seed/perch/400/300',
                imageHint: 'perch fish',
                categoryId: 'cat-1',
                orderOptions: [
                    { type: 'quantity', label: 'Stück', description: 'ca. 300-500g pro Fisch' }
                ]
            },
            {
                id: 'prod-1-2',
                name: 'Meeresfrüchte',
                image: 'https://picsum.photos/seed/seafood/400/300',
                imageHint: 'seafood platter',
                categoryId: 'cat-1',
                orderOptions: [
                    { type: 'portion', label: '0.5kg' },
                    { type: 'portion', label: '1kg' },
                    { type: 'portion', label: '1.5kg' },
                ]
            }
        ]
    },
    {
        id: 'cat-2',
        name: 'Sushi',
        image: 'https://picsum.photos/seed/sushi/600/400',
        imageHint: 'sushi platter',
        pickupDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        products: [
            {
                id: 'prod-2-1',
                name: 'Lachs Nigiri',
                image: 'https://picsum.photos/seed/nigiri/400/300',
                imageHint: 'salmon nigiri',
                categoryId: 'cat-2',
                orderOptions: [
                    { type: 'quantity', label: '2 Stück' },
                    { type: 'quantity', label: '4 Stück' },
                    { type: 'quantity', label: '6 Stück' },
                ]
            },
            {
                id: 'prod-2-2',
                name: 'California Roll',
                image: 'https://picsum.photos/seed/california/400/300',
                imageHint: 'california roll',
                categoryId: 'cat-2',
                orderOptions: [
                    { type: 'quantity', label: '4 Stück' },
                    { type: 'quantity', label: '8 Stück' },
                ]
            }
        ]
    }
]

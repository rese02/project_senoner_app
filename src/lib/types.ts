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
  product: 'Sushi' | 'Fresh Fish' | 'Other' | string; // Allow for dynamic products
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

// New types for product management
export type OrderOption = {
    type: 'quantity' | 'weight' | 'portion';
    label: string; // e.g., 'Stück', '0.5kg', '1kg'
    description?: string; // e.g., 'im Durchschnitt 500g'
}

export type Product = {
    id: string;
    name: string;
    image: string;
    imageHint: string;
    categoryId: string;
    orderOptions: OrderOption[];
}

export type Category = {
    id: string;
    name: string;
    image: string;
    imageHint: string;
    pickupDays: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
    products: Product[];
}

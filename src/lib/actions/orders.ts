'use server';

import { verifySession } from '@/lib/auth';
import { orders, users } from '@/lib/data';
import type { Order } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function placeOrder(
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> {
  const session = await verifySession();
  if (!session) {
    return { message: 'Not authenticated' };
  }

  const product = formData.get('product') as Order['product'] | null;
  const details = formData.get('details') as string;
  const pickupDate = formData.get('pickup-date') as string;

  if (!product || !details || !pickupDate) {
    return { message: 'Missing required fields' };
  }

  const customer = users.find(u => u.id === session.userId);
  if (!customer) {
      return { message: 'Customer not found' };
  }

  const newOrder: Order = {
    id: `order-${Date.now()}`,
    customerId: session.userId,
    customerName: customer.name,
    product,
    details,
    date: pickupDate,
    status: 'pending',
  };

  orders.unshift(newOrder);

  revalidatePath('/dashboard/pre-order');
  return { message: 'success' };
}

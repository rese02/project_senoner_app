'use server';

import { verifySession } from '@/lib/auth';
import type { Order, User } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { addDocumentNonBlocking, firestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

export async function placeOrder(
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> {
  const session = await verifySession();
  if (!session || !session.user) {
    return { message: 'Not authenticated' };
  }

  const product = formData.get('product') as Order['product'] | null;
  const details = formData.get('details') as string;
  const pickupDate = formData.get('pickup-date') as string;

  if (!product || !details || !pickupDate) {
    return { message: 'Missing required fields' };
  }

  const customer = session.user as User;

  const newOrder = {
    customerId: session.userId,
    customerName: customer.name,
    product,
    details,
    date: pickupDate,
    status: 'pending',
    createdAt: serverTimestamp(),
  };

  const ordersCollection = collection(firestore, `users/${session.userId}/preorders`);
  await addDocumentNonBlocking(ordersCollection, newOrder);

  revalidatePath('/dashboard');
  return { message: 'success' };
}

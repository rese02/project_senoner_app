'use server';

import { verifySession } from '@/lib/auth';
import { users } from '@/lib/data';
import { User } from '../types';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> {
  const session = await verifySession();
  if (!session) {
    return { message: 'Not authenticated' };
  }

  const user = users.find((u) => u.id === session.userId);
  if (!user) {
    return { message: 'User not found' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (name) user.name = name;
  if (email) user.email = email;
  // In a real app, you would hash the password
  if (password) console.log('Password updated (in a real app, this would be hashed)');

  revalidatePath('/dashboard/profile');
  return { message: 'success' };
}

export async function processStamp(
  prevState: { message: string, customer: User | null },
  formData: FormData
): Promise<{ message: string, customer: User | null }> {
    const session = await verifySession();
    if (!session || session.role !== 'employee') {
        return { message: 'Not authorized', customer: null };
    }

    const customerId = formData.get('customerId') as string;
    const action = formData.get('action') as 'find' | 'stamp';

    if (!customerId) {
        return { message: 'Customer ID is required', customer: null };
    }

    const customer = users.find(u => u.id === customerId && u.role === 'customer');

    if (!customer) {
        return { message: 'Customer not found', customer: null };
    }

    if (action === 'find') {
        return { message: 'success_find', customer };
    }

    if (action === 'stamp') {
        customer.points += 1;
        if (customer.points % 10 === 0) {
            customer.rewards.push({
                id: `reward-${Date.now()}`,
                name: `Reward for ${customer.points} points`,
                date: new Date().toISOString().split('T')[0],
            });
        }
        revalidatePath('/scanner');
        revalidatePath('/dashboard');
        return { message: 'success_stamp', customer: null };
    }

    return { message: 'Invalid action', customer: null };
}

export async function redeemRewardAction(
    prevState: { message: string },
    formData: FormData
): Promise<{ message: string }> {
    const session = await verifySession();
    if (!session || session.role !== 'employee') {
        return { message: 'Not authorized' };
    }

    const customerId = formData.get('customerId') as string;
    if (!customerId) {
        return { message: 'Customer ID is required' };
    }

    const customer = users.find(u => u.id === customerId && u.role === 'customer');
    if (!customer) {
        return { message: 'Customer not found' };
    }

    if (customer.rewards.length > 0) {
        customer.rewards.pop(); // Redeem the most recent reward
        revalidatePath('/scanner');
        revalidatePath('/dashboard');
        return { message: 'success' };
    }

    return { message: 'No rewards to redeem' };
}

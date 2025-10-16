'use server';

import { verifySession } from '@/lib/auth';
import { User } from '../types';
import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAuth } from '../auth';

export async function updateUserProfile(
  prevState: { message: string },
  formData: FormData
): Promise<{ message: string }> {
  const session = await verifySession();
  if (!session) {
    return { message: 'Not authenticated' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userUpdate: { displayName?: string, email?: string, password?: string } = {};
    if (name) userUpdate.displayName = name;
    if (email) userUpdate.email = email;
    if (password) userUpdate.password = password;
    
    await getFirebaseAuth().updateUser(session.userId, userUpdate);

    const userDocRef = firestore.collection('users').doc(session.userId);
    const userDocUpdate: {name?: string, email?: string} = {};
    if (name) userDocUpdate.name = name;
    if (email) userDocUpdate.email = email;

    if(Object.keys(userDocUpdate).length > 0) {
      await userDocRef.update(userDocUpdate);
    }

    revalidatePath('/dashboard/profile');
    return { message: 'success' };
  } catch (e) {
    console.error(e);
    return { message: 'Error updating profile' };
  }
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
    
    const customerRef = firestore.collection('users').doc(customerId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
        return { message: 'Customer not found', customer: null };
    }
    
    const customer = { id: customerDoc.id, ...customerDoc.data() } as User;

    if (customer.role !== 'customer') {
      return { message: 'Cannot apply stamp to non-customer accounts', customer: null };
    }

    if (action === 'find') {
        return { message: 'success_find', customer: { ...customer } };
    }

    if (action === 'stamp') {
        const currentPoints = customer.points || 0;
        const newPoints = currentPoints + 1;
        const updateData: any = { points: newPoints };
        
        if (newPoints % 10 === 0) {
            const newReward = {
                id: `reward-${Date.now()}`,
                name: `Reward for ${newPoints} points`,
                date: new Date().toISOString().split('T')[0],
            };
            updateData.rewards = FieldValue.arrayUnion(newReward);
        }

        await customerRef.update(updateData);
        revalidatePath('/scanner');
        revalidatePath('/dashboard/loyalty');
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

    const customerRef = firestore.collection('users').doc(customerId);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
        return { message: 'Customer not found' };
    }
    
    const customer = customerDoc.data() as User;

    if (customer.rewards && customer.rewards.length > 0) {
        const latestReward = customer.rewards[customer.rewards.length - 1];
        await customerRef.update({
            rewards: FieldValue.arrayRemove(latestReward)
        });
        revalidatePath('/scanner');
        revalidatePath('/dashboard/loyalty');
        return { message: 'success' };
    }

    return { message: 'No rewards to redeem' };
}

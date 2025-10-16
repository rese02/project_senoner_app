'use client';
import { useState, useEffect, useActionState } from 'react';
import { protectPage } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, QrCode, ScanLine, Star, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { users } from '@/lib/data';
import type { User } from '@/lib/types';
import { processStamp, redeemRewardAction } from '@/lib/actions/users';

const initialStampState = {
  message: '',
  customer: null as User | null,
};

const initialRedeemState = {
    message: '',
};

export default function ScannerPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { toast } = useToast();
  const [scannedCustomer, setScannedCustomer] = useState<User | null>(null);
  const [customerIdInput, setCustomerIdInput] = useState('');

  const [stampState, stampAction] = useActionState(processStamp, initialStampState);
  const [redeemState, redeemAction] = useActionState(redeemRewardAction, initialRedeemState);

  useEffect(() => {
    protectPage('employee').then(authorized => {
      setIsAuthorized(authorized);
    });
  }, []);
  
  useEffect(() => {
    if (stampState.customer) {
        setScannedCustomer(stampState.customer);
    }
    if (stampState.message === 'success_find') {
      toast({ title: 'Customer Found', description: `Ready to process for ${stampState.customer?.name}.` });
    } else if (stampState.message === 'success_stamp') {
      toast({ title: 'Success', description: `Stamp added for ${scannedCustomer?.name}.` });
      handleCancel();
    } else if (stampState.message) {
      toast({ variant: 'destructive', title: 'Error', description: stampState.message });
      setScannedCustomer(null);
    }
  }, [stampState]);

  useEffect(() => {
    if (redeemState.message === 'success') {
        toast({ title: 'Success', description: `Reward redeemed for ${scannedCustomer?.name}.` });
        handleCancel();
    } else if (redeemState.message) {
        toast({ variant: 'destructive', title: 'Error', description: redeemState.message });
    }
  }, [redeemState]);


  const handleFindCustomer = (formData: FormData) => {
    formData.set('action', 'find');
    stampAction(formData);
  };
  
  const handleAddStamp = (formData: FormData) => {
    formData.set('action', 'stamp');
    stampAction(formData);
  }

  const handleRedeemReward = (formData: FormData) => {
    redeemAction(formData);
  }

  const handleCancel = () => {
    setScannedCustomer(null);
    setCustomerIdInput('');
    stampState.message = '';
    stampState.customer = null;
    redeemState.message = '';
  }


  if (isAuthorized === null) {
      return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4">
      <Card className="w-full max-w-sm bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <ScanLine className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="font-headline text-2xl">Employee Scanner</CardTitle>
          <CardDescription className="text-gray-400">Scan customer QR or enter ID.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scannedCustomer ? (
            <form action={handleFindCustomer}>
                <div className="space-y-4">
                    <div className="relative h-40 w-full overflow-hidden rounded-lg bg-black flex items-center justify-center">
                        <QrCode className="h-20 w-20 text-gray-600"/>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-[scan_3s_ease-in-out_infinite]"></div>
                    </div>
                    <style jsx>{`
                        @keyframes scan {
                            0% { transform: translateY(0); }
                            50% { transform: translateY(156px); }
                            100% { transform: translateY(0); }
                        }
                    `}</style>
                <div className="space-y-2">
                    <Label htmlFor="customerId" className="text-gray-300">Customer ID</Label>
                    <Input
                    id="customerId"
                    name="customerId"
                    value={customerIdInput}
                    onChange={(e) => setCustomerIdInput(e.target.value)}
                    placeholder="Enter customer ID (e.g., user-1)"
                    className="bg-gray-700 border-gray-600 text-white"
                    />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                    Find Customer
                </Button>
                </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <UserCheck className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-xl font-bold">{scannedCustomer.name}</h3>
              <p className="text-gray-400">Points: {scannedCustomer.points}</p>
              <div className="flex gap-4">
                <form action={handleAddStamp} className='w-full'>
                    <input type="hidden" name="customerId" value={scannedCustomer.id} />
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
                        <Star className="mr-2 h-4 w-4" /> Add Stamp
                    </Button>
                </form>
                <form action={handleRedeemReward} className='w-full'>
                    <input type="hidden" name="customerId" value={scannedCustomer.id} />
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-500" disabled={scannedCustomer.rewards.length === 0}>
                        <Award className="mr-2 h-4 w-4" /> Redeem
                    </Button>
                </form>
              </div>
              <Button variant="outline" onClick={handleCancel} className="w-full text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white">
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

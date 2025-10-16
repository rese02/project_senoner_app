'use client';
import { useState, useEffect } from 'react';
import { protectPage } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, QrCode, ScanLine, Star, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { users } from "@/lib/data";

export default function ScannerPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState('');
  const [scannedCustomer, setScannedCustomer] = useState<typeof users[0] | null>(null);

  useEffect(() => {
    protectPage('employee').then(authorized => {
      setIsAuthorized(authorized);
    });
  }, []);

  const handleScan = () => {
    const customer = users.find(u => u.id === customerId && u.role === 'customer');
    if (customer) {
      setScannedCustomer(customer);
      toast({ title: 'Customer Found', description: `Ready to process for ${customer.name}.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Customer not found.' });
      setScannedCustomer(null);
    }
  };

  const addStamp = () => {
    if (scannedCustomer) {
      toast({ title: 'Success', description: `Stamp added for ${scannedCustomer.name}.` });
      setScannedCustomer(null);
      setCustomerId('');
    }
  };

  const redeemReward = () => {
    if (scannedCustomer) {
      toast({ title: 'Success', description: `Reward redeemed for ${scannedCustomer.name}.` });
      setScannedCustomer(null);
      setCustomerId('');
    }
  };

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
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter customer ID (e.g., user-1)"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <Button onClick={handleScan} className="w-full bg-accent hover:bg-accent/90">
                Find Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <UserCheck className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-xl font-bold">{scannedCustomer.name}</h3>
              <p className="text-gray-400">Points: {scannedCustomer.points}</p>
              <div className="flex gap-4">
                <Button onClick={addStamp} className="w-full bg-blue-600 hover:bg-blue-500">
                  <Star className="mr-2 h-4 w-4" /> Add Stamp
                </Button>
                <Button onClick={redeemReward} className="w-full bg-green-600 hover:bg-green-500">
                  <Award className="mr-2 h-4 w-4" /> Redeem
                </Button>
              </div>
              <Button variant="outline" onClick={() => setScannedCustomer(null)} className="w-full text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white">
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

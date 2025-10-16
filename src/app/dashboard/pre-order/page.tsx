'use client';
import { useFormState } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { orders } from '@/lib/data';
import { placeOrder } from '@/lib/actions/orders';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { verifySession } from '@/lib/auth-client';

const initialState = {
  message: '',
};

export default function PreOrderPage() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(placeOrder, initialState);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

   useEffect(() => {
    async function getSession() {
        const session = await verifySession();
        if (session?.userId) {
            setUserId(session.userId);
            const filteredOrders = orders.filter(o => o.customerId === session.userId);
            setUserOrders(filteredOrders);
        }
    }
    getSession();
  }, []);

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: 'Order Placed!',
        description: 'Your pre-order has been successfully submitted.',
      });
      if(userId) {
        setUserOrders(orders.filter(o => o.customerId === userId));
      }
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast, userId]);

  const getStatusVariant = (status: (typeof orders)[0]['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'ready': return 'default';
      case 'collected': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-2">
        <form action={formAction}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Place a Pre-Order</CardTitle>
              <CardDescription>
                Order your favorite sushi or fresh fish in advance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product Type</Label>
                <Select name="product">
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sushi">Sushi</SelectItem>
                    <SelectItem value="Fresh Fish">Fresh Fish</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Order Details</Label>
                <Textarea
                  id="details"
                  name="details"
                  placeholder="e.g., '2x Salmon Nigiri' or '1kg Cod'"
                  required
                />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="pickup-date">Pickup Date</Label>
                  <Input id="pickup-date" name="pickup-date" type="date" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Place Order</Button>
            </CardFooter>
          </Card>
        </form>
      </div>
      <div className="md:col-span-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Order History</CardTitle>
            <CardDescription>
              Track your past and current pre-orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {userOrders.length === 0 && (
                <p className="text-center text-muted-foreground pt-4">You have no pre-orders.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

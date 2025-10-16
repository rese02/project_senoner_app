'use client';
import React, { useActionState, useEffect, useState } from 'react';
import Image from 'next/image';
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
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { orders as initialOrders, categories } from '@/lib/data';
import { placeOrder } from '@/lib/actions/orders';
import { useToast } from '@/hooks/use-toast';
import type { Order, Product } from '@/lib/types';
import { verifySession } from '@/lib/auth-client';
import { ShoppingCart } from 'lucide-react';

const initialState = {
  message: '',
};

type CartItem = {
  product: Product;
  option: string;
  quantity: number;
};

export default function PreOrderPage() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(placeOrder, initialState);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pickupDate, setPickupDate] = useState('');

  useEffect(() => {
    async function getSession() {
      const session = await verifySession();
      if (session?.userId) {
        setUserId(session.userId);
        const filteredOrders = initialOrders.filter(o => o.customerId === session.userId);
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
      if (userId) {
        // This part is tricky with mock data; in a real app, you'd refetch.
        // For now, we just show what's in the initial data.
        setUserOrders(initialOrders.filter(o => o.customerId === userId));
      }
      setCart([]); // Clear cart on successful order
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast, userId]);
  
  const handleAddToCart = (product: Product, option: string, quantity: number) => {
    if (quantity > 0) {
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id && item.option === option);
            if (existingItemIndex > -1) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += quantity;
                return updatedCart;
            }
            return [...prevCart, { product, option, quantity }];
        });
        toast({
            title: "Added to cart",
            description: `${quantity} x ${product.name} (${option})`,
        });
    }
  };
  
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  }

  const handleSubmitOrder = (formData: FormData) => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Your cart is empty.' });
      return;
    }
    if (!pickupDate) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a pickup date.' });
        return;
    }

    const orderDetails = cart.map(item => `${item.quantity}x ${item.product.name} (${item.option})`).join(', ');
    formData.set('details', orderDetails);
    formData.set('pickup-date', pickupDate);
    // For simplicity, we'll just use the category name for the 'product' field
    formData.set('product', categories.find(c => c.id === cart[0].product.categoryId)?.name || 'Mixed Order');

    formAction(formData);
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'ready': return 'default';
      case 'collected': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-3">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Place a Pre-Order</CardTitle>
            <CardDescription>
              Order your favorite products in advance. Available for pickup on selected days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {categories.map(category => (
                <AccordionItem value={category.id} key={category.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      <Image src={category.image} alt={category.name} width={60} height={40} className="rounded-md object-cover" data-ai-hint={category.imageHint} />
                      <div>
                        <p className="font-semibold text-lg">{category.name}</p>
                        <p className="text-xs text-muted-foreground">Pickup: {category.pickupDays.join(', ')}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-4 md:grid-cols-2">
                      {category.products.map(product => {
                        const [selectedOption, setSelectedOption] = useState(product.orderOptions[0].label);
                        const [quantity, setQuantity] = useState(1);
                        return (
                          <Card key={product.id}>
                            <CardHeader className="p-4">
                                <div className="aspect-[4/3] rounded-md overflow-hidden mb-4">
                                    <Image src={product.image} alt={product.name} width={400} height={300} className="object-cover w-full h-full" data-ai-hint={product.imageHint} />
                                </div>
                                <CardTitle className="text-base">{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`option-${product.id}`}>Option</Label>
                                    <Select value={selectedOption} onValueChange={setSelectedOption}>
                                        <SelectTrigger id={`option-${product.id}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {product.orderOptions.map(opt => (
                                                <SelectItem key={opt.label} value={opt.label}>{opt.label} {opt.description && `(${opt.description})`}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`quantity-${product.id}`}>Quantity</Label>
                                    <Input id={`quantity-${product.id}`} type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                                </div>
                            </CardContent>
                            <CardFooter className="p-4">
                                <Button className="w-full" onClick={() => handleAddToCart(product, selectedOption, quantity)}>Add to Cart</Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2 space-y-6">
        <form action={handleSubmitOrder}>
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart /> Your Cart
                </CardTitle>
                <CardDescription>Review your items and place your order.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cart.length === 0 ? (
                        <p className="text-center text-muted-foreground">Your cart is empty.</p>
                    ) : (
                        <div className="space-y-2">
                            {cart.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <p>{item.quantity}x {item.product.name} ({item.option})</p>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCart(cart.filter((_, i) => i !== index))}>
                                        <span className="text-red-500">×</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                     <div className="space-y-2 pt-4">
                        <Label htmlFor="pickup-date">Pickup Date</Label>
                        <Input id="pickup-date" name="pickup-date" type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={getTodayString()} required />
                    </div>
                </CardContent>
                <CardFooter>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={cart.length === 0}>
                    Place Order
                </Button>
                </CardFooter>
            </Card>
        </form>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Order History</CardTitle>
            <CardDescription>Track your past and current pre-orders.</CardDescription>
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

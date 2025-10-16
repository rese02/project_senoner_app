import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { orders } from "@/lib/data";
import { verifySession } from "@/lib/auth";

export default async function PreOrderPage() {
  const session = await verifySession();
  const userOrders = orders.filter(o => o.customerId === session?.userId);

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
              <Select>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sushi">Sushi</SelectItem>
                  <SelectItem value="fresh-fish">Fresh Fish</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Order Details</Label>
              <Textarea
                id="details"
                placeholder="e.g., '2x Salmon Nigiri' or '1kg Cod'"
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="pickup-date">Pickup Date</Label>
                <Input id="pickup-date" type="date" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-accent hover:bg-accent/90">Place Order</Button>
          </CardFooter>
        </Card>
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orders } from "@/lib/data";
import { OrdersDataTable } from "@/components/admin/OrdersDataTable";

export default function AdminOrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pre-Orders</CardTitle>
        <CardDescription>Manage and track all customer pre-orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <OrdersDataTable data={orders} />
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrdersDataTable } from "@/components/admin/OrdersDataTable";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { subDays, subMonths, isAfter, startOfDay } from "date-fns";
import { Trash2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, where, getDocs, doc } from "firebase/firestore";

type TimePeriod = "all" | "today" | "yesterday" | "last7days" | "last30days" | "last6months";

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const [filterPeriod, setFilterPeriod] = useState<TimePeriod>("all");
  
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'preorders'); // Assuming a top-level 'preorders' collection
  }, [firestore]);
  
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const handleDeletePeriod = async () => {
    if (!firestore || !orders) return;
    
    if (filterPeriod === "all") {
        const batch = [];
        for (const order of orders) {
            batch.push(deleteDocumentNonBlocking(doc(firestore, `preorders`, order.id)));
        }
        await Promise.all(batch);
        return;
    }

    const now = new Date();
    let startDate: Date;

    switch (filterPeriod) {
      case "today":
        startDate = startOfDay(now);
        break;
      case "yesterday":
        startDate = startOfDay(subDays(now, 1));
        break;
      case "last7days":
        startDate = startOfDay(subDays(now, 7));
        break;
      case "last30days":
        startDate = startOfDay(subDays(now, 30));
        break;
      case "last6months":
        startDate = startOfDay(subMonths(now, 6));
        break;
      default:
        return;
    }

    const endDate = filterPeriod === 'yesterday' ? startOfDay(now) : undefined;
    
    const ordersToDelete = orders.filter(order => {
        const orderDate = new Date(order.date);
        if (endDate) {
            return isAfter(orderDate, startDate) && orderDate < endDate;
        }
        return isAfter(orderDate, startDate);
    });

    const batch = [];
    for (const order of ordersToDelete) {
        batch.push(deleteDocumentNonBlocking(doc(firestore, 'preorders', order.id)));
    }
    await Promise.all(batch);
  };
  
  if(isLoading) return <p>Loading orders...</p>

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <CardTitle>Pre-Orders</CardTitle>
          <CardDescription>Manage and track all customer pre-orders.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Select onValueChange={(value) => setFilterPeriod(value as TimePeriod)} defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select period to delete" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last6months">Last 6 Months</SelectItem>
                </SelectContent>
            </Select>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected orders.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePeriod}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <OrdersDataTable data={orders || []} />
      </CardContent>
    </Card>
  );
}

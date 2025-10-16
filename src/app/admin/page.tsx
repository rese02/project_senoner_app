import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, ShoppingBasket, Users } from "lucide-react";
import { orders, activity } from "@/lib/data";
import ActivityChart from "@/components/admin/ActivityChart";

export default function AdminDashboardPage() {
  const newOrdersCount = orders.filter((o) => o.status === "pending").length;
  const totalStamps = activity.reduce((sum, day) => sum + day.stamps, 0);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Pre-Orders</CardTitle>
            <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newOrdersCount}</div>
            <p className="text-xs text-muted-foreground">
              New orders waiting for confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stamps This Week
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStamps}</div>
            <p className="text-xs text-muted-foreground">
              Total stamps given in the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last week
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer Activity</CardTitle>
            <CardDescription>
              Overview of customer stamp collections this week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={activity} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

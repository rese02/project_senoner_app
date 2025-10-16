import Image from "next/image";
import { verifySession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Star } from "lucide-react";

export default async function CustomerDashboardPage() {
  const session = await verifySession();
  const user = session?.user;

  if (!user) return null;

  const pointsToNextReward = 10 - (user.points % 10);
  const progressPercentage = (user.points % 10) * 10;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${user.id}&qzone=1&bgcolor=F9E7E4`;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-3 xl:col-span-1 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Your Loyalty Card</CardTitle>
          <CardDescription>Present this QR code at checkout</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="rounded-lg bg-white p-4">
            <Image
              src={qrCodeUrl}
              alt="Your personal QR code"
              width={250}
              height={250}
              priority
            />
          </div>
          <p className="text-sm text-muted-foreground font-semibold">{user.name}</p>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 xl:col-span-2 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Loyalty Points
            </CardTitle>
            <CardDescription>Track your progress towards your next reward.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">{user.points}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div>
              <Progress value={progressPercentage} className="w-full" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {pointsToNextReward} points away from your next reward!
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Your Rewards
                </CardTitle>
                <CardDescription>Rewards you have earned.</CardDescription>
            </CardHeader>
            <CardContent>
                {user.rewards.length > 0 ? (
                    <ul className="space-y-4">
                        {user.rewards.map(reward => (
                            <li key={reward.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{reward.name}</p>
                                    <p className="text-sm text-muted-foreground">Earned on {reward.date}</p>
                                </div>
                                <span className="text-sm font-medium text-primary">Redeem</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground">No rewards earned yet. Keep collecting points!</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

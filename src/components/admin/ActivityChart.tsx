"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Activity } from "@/lib/types";

export default function ActivityChart({ data }: { data: Activity[] }) {
  return (
    <ChartContainer
      config={{
        stamps: {
          label: "Stamps",
          color: "hsl(var(--primary))",
        },
      }}
      className="min-h-[200px] w-full"
    >
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Bar dataKey="stamps" fill="var(--color-stamps)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

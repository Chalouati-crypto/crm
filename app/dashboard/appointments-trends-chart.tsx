"use client";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getMonthlyAppointmentTrends,
  getWeeklyAppointmentTrends,
} from "@/server/actions/bar-chart-queries";

// Server action imports

// Type for chart data
interface ChartPoint {
  month: string;
  visits: number;
}

export function AppointmentTrendsChart() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [view, setView] = useState<"monthly" | "weekly">("monthly");
  const [highlight, setHighlight] = useState<ChartPoint | null>(null);

  useEffect(() => {
    async function fetchData() {
      let rawData;
      if (view === "monthly") {
        rawData = await getMonthlyAppointmentTrends();
      } else {
        rawData = await getWeeklyAppointmentTrends();
      }

      // Map server rows ({ month, appointments }) to chart ({ month, visits })
      const mapped = rawData.map((row) => ({
        month: row.month,
        visits: row.appointments,
      }));

      setChartData(mapped);

      // Highlight the last data point
      if (mapped.length) {
        setHighlight(mapped[mapped.length - 1]);
      }
    }

    fetchData();
  }, [view]);

  return (
    <Card className="h-fit bg-purple-50/70 border-0 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Patient Visits</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={view === "monthly" ? "default" : "outline"}
              size="sm"
              className={
                view === "monthly"
                  ? "bg-[#952CA7] hover:bg-purple-700"
                  : "border-purple-200 hover:bg-purple-100"
              }
              onClick={() => setView("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={view === "weekly" ? "default" : "outline"}
              size="sm"
              className={
                view === "weekly"
                  ? "bg-[#952CA7] hover:bg-purple-700"
                  : "border-purple-200 hover:bg-purple-100"
              }
              onClick={() => setView("weekly")}
            >
              Weekly
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-purple-600">
                          Visits: {payload[0].value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
              />
              <Bar
                dataKey="visits"
                fill="#952CA7"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {highlight && (
          <>
            <div className="mt-3 flex justify-center">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                {highlight.month}
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-2xl font-bold">{highlight.visits}</div>
              <div className="text-sm text-gray-500">{highlight.month}</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

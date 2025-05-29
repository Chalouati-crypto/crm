"use client";
import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Calendar, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllKPIData } from "@/server/actions/kpi-queries";

interface KPICardProps {
  title: string;
  subtitle: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
}

function KPICard({
  title,
  subtitle,
  value,
  description,
  icon,
  trend,
}: KPICardProps) {
  return (
    <Card className="bg-purple-50/70 border-0 shadow-sm flex-shrink-0 w-72 hover:shadow-md transition-shadow backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <div className="text-[#952CA7]">{icon}</div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function KPICards() {
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call server action directly
        const data = await getAllKPIData();

        // Map database data to match dummy structure
        const mappedData = [
          {
            title: "Satisfaction",
            subtitle: "Score",
            value: `${data.satisfactionScore}★`,
            description: "Average rating",
            icon: <Star className="w-6 h-6" />,
          },
          {
            title: "Response Rate",
            subtitle: "Surveys",
            value: data.responseRate,
            description: "Survey responses",
            icon: <TrendingUp className="w-6 h-6" />,
          },
          {
            title: "Completion Rate",
            subtitle: "Appointments",
            value: data.completionRate,
            description: "Appointments completed",
            icon: <Calendar className="w-6 h-6" />,
          },
          {
            title: `${data.activeAccounts}p`,
            subtitle: "",
            value: "",
            description: "Active contacts",
            icon: <Users className="w-6 h-6" />,
          },
        ];

        setKpiData(mappedData);
      } catch (error) {
        console.error("Error fetching KPI data:", error);
        // Fallback to static data
        setKpiData([
          {
            title: "Satisfaction",
            subtitle: "Score",
            value: "4.8★",
            description: "Average rating",
            icon: <Star className="w-6 h-6" />,
          },
          {
            title: "Response Rate",
            subtitle: "Surveys",
            value: "72%",
            description: "Survey responses",
            icon: <TrendingUp className="w-6 h-6" />,
          },
          {
            title: "Completion Rate",
            subtitle: "Appointments",
            value: "85%",
            description: "Appointments completed",
            icon: <Calendar className="w-6 h-6" />,
          },
          {
            title: "150p",
            subtitle: "",
            value: "",
            description: "Active patients",
            icon: <Users className="w-6 h-6" />,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Consultant Performance Summary
        </h2>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex gap-6 pb-3" style={{ width: "max-content" }}>
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="bg-purple-50/70 border-0 shadow-sm w-72 animate-pulse"
              >
                <CardContent className="p-6">
                  <div className="h-32 rounded-md bg-gray-200" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Consultant Performance Summary
        </h2>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex gap-6 pb-3" style={{ width: "max-content" }}>
          {kpiData.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi.title}
              subtitle={kpi.subtitle}
              value={kpi.value}
              description={kpi.description}
              icon={kpi.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

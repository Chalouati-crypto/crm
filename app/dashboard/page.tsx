import { getCurrentUser } from "@/lib/get-current-user";
import { AppointmentCalendar } from "./appointments-calendar";
import { AppointmentTrendsChart } from "./appointments-trends-chart";
import KPICards from "./kpi-cards";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return;
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Top Row: Welcome + KPI Cards */}
        <div className="grid grid-cols-12 gap-8">
          {/* Welcome Section - takes 3 columns */}
          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Welcome back</p>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                {user.name}
              </h1>
            </div>
          </div>

          {/* KPI Cards Section - takes 9 columns */}
          <div className="col-span-12 lg:col-span-9">
            <KPICards />
          </div>
        </div>

        {/* Middle Row: Calendar + Chart */}
        <div className="grid grid-cols-12 gap-8">
          {/* Calendar under welcome section - 3 columns */}
          <div className="col-span-12 lg:col-span-3">
            <AppointmentCalendar />
          </div>

          {/* Chart spans remaining width - 9 columns */}
          <div className="col-span-12 lg:col-span-9">
            <AppointmentTrendsChart />
          </div>
        </div>
      </div>
    </div>
  );
}

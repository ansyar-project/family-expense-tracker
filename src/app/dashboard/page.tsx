import React from 'react'
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { getCategories, getPlaces, getMonthlyStats, getRecentEntries, getSummary } from "@/lib/actions";
import SummaryCard from "@/components/SummaryCard";
import EntryList from "@/components/EntryList";
import PieChartComponent from "@/components/PieChartComponent";
import BarChartComponent from "@/components/BarChartComponent";
import { FaArrowDown, FaTrophy, FaChartPie, FaChartBar, FaBalanceScale } from "react-icons/fa";
import DashboardFilterBar from "@/components/DashboardFilterBar";

// Extend the session user type to include 'id'
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const Dashboard = async ({ searchParams }: { searchParams?: Promise<{ categoryId?: string; placeId?: string; date?: string; month?: string; year?: string }> }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;

  // Fetch categories and places using server actions
  const categories = await getCategories();
  const places = await getPlaces();

  // Use filters from searchParams
  const filters = {
    ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params?.placeId ? { placeId: params.placeId } : {}),
    ...(params?.date ? { date: params.date } : {}),
    ...(params?.month ? { month: params.month } : {}),
    ...(params?.year ? { year: params.year } : {}),
  };

  // Pass filters to your server actions
  const stats = await getMonthlyStats(session.user.id, filters);
  const entries = await getRecentEntries(session.user.id, 10, filters);
  const summary = await getSummary(session.user.id, filters);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-900 text-gray-100 ml-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Dashboard</h1>

      {/* Filter Bar */}
      <div className="mb-6 md:mb-8">
        <DashboardFilterBar
          categories={categories}
          places={places}
          initial={filters}
          basePath="/dashboard"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="min-w-0">
          <SummaryCard
            title="Balance"
            value={summary.balance.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            icon={<FaBalanceScale />}
            color="bg-green-700"
          />
        </div>
        <div className="min-w-0">
          <SummaryCard
            title="Last Month's Spending"
            value={stats.lastMonthSpending.toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            icon={<FaArrowDown />}
            color="bg-red-700"
          />
        </div>
        <div className="min-w-0">
          <SummaryCard
            title="Monthly Spending to Date"
            value={stats.monthlyOutcomeToDate
              .reduce((sum, item) => sum + (item._sum.amount ?? 0), 0)
              .toLocaleString("en-AU", { style: "currency", currency: "AUD" })}
            icon={<FaChartBar />}
            color="bg-yellow-700"
          />
        </div>
        <div className="min-w-0">
          <SummaryCard
            title="Highest Spending (This Month)"
            value={stats.highestSpendingThisMonth?.amount
              ? stats.highestSpendingThisMonth.amount.toLocaleString("en-AU", { style: "currency", currency: "AUD" })
              : "-"}
            icon={<FaTrophy />}
            color="bg-purple-700"
          />
        </div>
        <div className="min-w-0">
          <SummaryCard
            title="Highest Spending (All Time)"
            value={stats.highestSpendingAllTime?.amount
              ? stats.highestSpendingAllTime.amount.toLocaleString("en-AU", { style: "currency", currency: "AUD" })
              : "-"}
            icon={<FaTrophy />}
            color="bg-blue-700"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gray-800 rounded-lg p-4 mb-4 lg:mb-0 min-w-0">
          <h2 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
            <FaChartPie /> Category-wise Spending
          </h2>
          <PieChartComponent
            data={stats.categoryWiseSpending.map(item => ({
              name: item.categoryName,
              value: item._sum.amount ?? 0,
            }))}
          />
        </div>
        <div className="bg-gray-800 rounded-lg p-4 lg:col-span-2 min-w-0">
          <h2 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
            <FaChartBar /> Monthly Cash Flow
          </h2>
          <BarChartComponent
            data={
              filters.month
                ? stats.monthlyCashFlow.filter(
                    (item) =>
                      new Date(item.month).getMonth() + 1 === Number(filters.month) &&
                      (!filters.year || new Date(item.month).getFullYear() === Number(filters.year))
                  )
                : stats.monthlyCashFlow
            }
          />
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-base md:text-lg font-semibold mb-4">Recent Entries</h2>
        <EntryList entries={entries.map(entry => ({
          ...entry,
          date: entry.date instanceof Date ? entry.date.toISOString() : entry.date,
        }))} />
      </div>
    </main>
  )
}

export default Dashboard
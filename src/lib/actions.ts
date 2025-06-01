"use server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { format } from "date-fns";
import { Prisma, EntryType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

// Fetch summary data for a user
export async function getSummary(
  userId: string,
  filters?: {
    categoryId?: string;
    placeId?: string;
    month?: string;
    year?: string;
  }
) {
  const where: Prisma.EntryWhereInput = { userId };
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.placeId) where.placeId = filters.placeId;

  // Month & Year filter logic
  if (filters?.month) {
    const year = filters?.year
      ? Number(filters.year)
      : new Date().getFullYear();
    const monthNum = Number(filters.month);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);
    where.date = { gte: start, lt: end };
  } else if (filters?.year) {
    const year = Number(filters.year);
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    where.date = { gte: start, lt: end };
  }

  const [income, expense] = await Promise.all([
    prisma.entry.aggregate({
      where: { ...where, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.entry.aggregate({
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);
  const totalIncome = income._sum.amount || 0;
  const totalExpense = expense._sum.amount || 0;
  const balance = totalIncome - totalExpense;
  return { totalIncome, totalExpense, balance };
}

// Fetch recent entries for a user
export async function getRecentEntries(
  userId: string,
  take = 10,
  filters?: {
    categoryId?: string;
    placeId?: string;
    month?: string;
    year?: string;
  }
) {
  const where: Prisma.EntryWhereInput = { userId };
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.placeId) where.placeId = filters.placeId;

  // --- Month & Year filter logic ---
  if (filters?.month) {
    const year = filters?.year
      ? Number(filters.year)
      : new Date().getFullYear();
    const monthNum = Number(filters.month);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);
    where.date = { gte: start, lt: end };
  } else if (filters?.year) {
    const year = Number(filters.year);
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    where.date = { gte: start, lt: end };
  }

  return prisma.entry.findMany({
    where,
    include: { category: true, place: true },
    orderBy: { date: "desc" },
    take,
  });
}

// Add a new entry, creating category/place if needed
export async function addEntry(data: {
  userId: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  categoryName: string; // Accept category name, not just ID
  placeName?: string; // Accept place name, not just ID
  date: Date;
  description?: string;
}) {
  // Find or create category
  let category = await prisma.category.findUnique({
    where: { name: data.categoryName },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { name: data.categoryName },
    });
  }

  // Find or create place (if provided)
  let placeId: string | undefined = undefined;
  if (data.placeName) {
    let place = await prisma.place.findUnique({
      where: { name: data.placeName },
    });
    if (!place) {
      place = await prisma.place.create({ data: { name: data.placeName } });
    }
    placeId = place.id;
  }

  revalidatePath("/dashboard/add");

  // Create the entry
  return prisma.entry.create({
    data: {
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      categoryId: category.id,
      placeId,
      date: data.date,
      description: data.description,
    },
  });
}

// Paginated entries
export async function getPaginatedEntries(
  userId: string,
  {
    page = 1,
    pageSize = 10,
    filters,
  }: {
    page?: number;
    pageSize?: number;
    filters?: {
      categoryId?: string;
      placeId?: string;
      month?: string;
      year?: string;
    };
  }
) {
  const where: Prisma.EntryWhereInput = { userId };
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.placeId) where.placeId = filters.placeId;

  // --- Month & Year filter logic ---
  if (filters?.month) {
    const year = filters?.year
      ? Number(filters.year)
      : new Date().getFullYear();
    const monthNum = Number(filters.month);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);
    where.date = { gte: start, lt: end };
  } else if (filters?.year) {
    const year = Number(filters.year);
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    where.date = { gte: start, lt: end };
  }

  const [entries, total] = await Promise.all([
    prisma.entry.findMany({
      where,
      include: { category: true, place: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.entry.count({ where }),
  ]);

  return {
    entries,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// Fetch monthly statistics for a user
export async function getMonthlyStats(
  userId: string,
  filters?: {
    categoryId?: string;
    placeId?: string;
    month?: string;
    year?: string;
  }
) {
  // Determine which month to use for "last month spending"
  let lastMonthStart: Date, lastMonthEnd: Date;
  if (filters?.month && filters?.year) {
    // Use previous month of the selected filter
    const year = Number(filters.year);
    const month = Number(filters.month) - 2; // -2 for previous month (0-based)
    const prevMonthDate = new Date(year, month, 1);
    lastMonthStart = startOfMonth(prevMonthDate);
    lastMonthEnd = endOfMonth(prevMonthDate);
  } else {
    // Default: previous calendar month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    lastMonthStart = startOfMonth(lastMonth);
    lastMonthEnd = endOfMonth(lastMonth);
  }

  const lastMonthSpendingAgg = await prisma.entry.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: lastMonthStart, lte: lastMonthEnd },
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.placeId && { placeId: filters.placeId }),
    },
    _sum: { amount: true },
  });
  const lastMonthSpending = lastMonthSpendingAgg._sum.amount || 0;

  // const now = new Date();
  const year = filters?.year ? Number(filters.year) : new Date().getFullYear();
  let monthStart = startOfMonth(new Date());
  let monthEnd = endOfMonth(new Date());

  // If month filter is provided, override monthStart and monthEnd
  if (filters?.month) {
    const month = filters.month.padStart(2, "0");
    monthStart = new Date(`${year}-${month}-01`);
    monthEnd = endOfMonth(monthStart);
  } else if (filters?.year) {
    monthStart = new Date(year, 0, 1);
    monthEnd = new Date(year + 1, 0, 0);
  }

  // Build filter object for queries
  const baseWhere = {
    userId,
    ...(filters?.categoryId && { categoryId: filters.categoryId }),
    ...(filters?.placeId && { placeId: filters.placeId }),
  };

  // Total outcome (expense) this month
  const totalOutcomeThisMonth = await prisma.entry.aggregate({
    where: {
      ...baseWhere,
      type: "EXPENSE",
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: { amount: true },
  });

  // Monthly outcome to date (per category)
  const monthlyOutcomeToDate = await prisma.entry.groupBy({
    by: ["categoryId"],
    where: {
      ...baseWhere,
      type: "EXPENSE",
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  // Highest spending entry this month
  const highestSpendingThisMonth = await prisma.entry.findFirst({
    where: {
      ...baseWhere,
      type: "EXPENSE",
      date: { gte: monthStart, lte: monthEnd },
    },
    orderBy: { amount: "desc" },
    include: { category: true, place: true },
  });

  // Highest spending entry all time
  const highestSpendingAllTime = await prisma.entry.findFirst({
    where: {
      ...baseWhere,
      type: "EXPENSE",
    },
    orderBy: { amount: "desc" },
    include: { category: true, place: true },
  });

  // Pie Chart: Category-wise spending this month
  const categoryWiseSpending = await prisma.entry.groupBy({
    by: ["categoryId"],
    where: {
      ...baseWhere,
      type: "EXPENSE",
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: { amount: true },
  });

  // Bar Chart: Monthly cash flow (income & expense per month for last 6 months or filtered month)
  let monthlyCashFlowRaw;
  if (filters?.month) {
    // If a specific month is filtered, only fetch that month
    monthlyCashFlowRaw = await prisma.entry.groupBy({
      by: ["type", "date"],
      where: {
        ...baseWhere,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
      orderBy: { date: "asc" },
    });
  } else {
    // If no month filter, fetch last 6 months
    const sixMonthsAgo = new Date(year, new Date().getMonth() - 5, 1);
    monthlyCashFlowRaw = await prisma.entry.groupBy({
      by: ["type", "date"],
      where: {
        ...baseWhere,
        date: { gte: sixMonthsAgo, lte: monthEnd },
      },
      _sum: { amount: true },
      orderBy: { date: "asc" },
    });
  }

  // Prepare data: group by month, then by type
  const monthlyMap: Record<string, { income: number; expense: number }> = {};

  monthlyCashFlowRaw.forEach((item) => {
    // Format date as "MMM yyyy" (e.g., "Jan 2024")
    const month = format(new Date(item.date), "MMM yyyy");
    if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
    if (item.type === "INCOME") {
      monthlyMap[month].income += item._sum.amount ?? 0;
    } else if (item.type === "EXPENSE") {
      monthlyMap[month].expense += item._sum.amount ?? 0;
    }
  });

  // Convert to array for chart
  const monthlyCashFlow = Object.entries(monthlyMap).map(([month, values]) => ({
    month,
    ...values,
  }));

  // 1. Get all category IDs from the groupBy result
  const categoryIds = monthlyOutcomeToDate.map((item) => item.categoryId);

  // 2. Fetch category names for those IDs
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  // 3. Map categoryId to name for easy lookup
  const categoryMap = Object.fromEntries(
    categories.map((cat) => [cat.id, cat.name])
  );

  // 4. Attach category name to each groupBy result
  const monthlyOutcomeToDateWithNames = monthlyOutcomeToDate.map((item) => ({
    ...item,
    categoryName: categoryMap[item.categoryId] || item.categoryId,
  }));

  // After you get categoryWiseSpending
  const catIds = categoryWiseSpending.map((item) => item.categoryId);
  const catNames = await prisma.category.findMany({
    where: { id: { in: catIds } },
    select: { id: true, name: true },
  });
  const catMap = Object.fromEntries(catNames.map((cat) => [cat.id, cat.name]));
  const categoryWiseSpendingWithNames = categoryWiseSpending.map((item) => ({
    ...item,
    categoryName: catMap[item.categoryId] || item.categoryId,
  }));

  return {
    totalOutcomeThisMonth: totalOutcomeThisMonth._sum.amount || 0,
    lastMonthSpending,
    monthlyOutcomeToDate: monthlyOutcomeToDateWithNames,
    highestSpendingThisMonth,
    highestSpendingAllTime,
    categoryWiseSpending: categoryWiseSpendingWithNames,
    monthlyCashFlow,
  };
}

// Fetch all categories
export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// Fetch all places
export async function getPlaces() {
  return prisma.place.findMany({ orderBy: { name: "asc" } });
}

// Edit an entry
export async function editEntry(
  entryId: string,
  data: {
    type?: "INCOME" | "EXPENSE";
    amount?: number;
    categoryName?: string;
    placeName?: string;
    date?: Date;
    description?: string;
  }
) {
  // Find or create category if categoryName is provided
  let categoryId: string | undefined = undefined;
  if (data.categoryName) {
    let category = await prisma.category.findUnique({
      where: { name: data.categoryName },
    });
    if (!category) {
      category = await prisma.category.create({
        data: { name: data.categoryName },
      });
    }
    categoryId = category.id;
  }

  // Find or create place if placeName is provided
  let placeId: string | undefined = undefined;
  if (data.placeName) {
    let place = await prisma.place.findUnique({
      where: { name: data.placeName },
    });
    if (!place) {
      place = await prisma.place.create({ data: { name: data.placeName } });
    }
    placeId = place.id;
  }

  return prisma.entry.update({
    where: { id: entryId },
    data: {
      ...(data.type && { type: data.type }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(categoryId && { categoryId }),
      ...(placeId && { placeId }),
      ...(data.date && { date: data.date }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

// Delete an entry
export async function deleteEntry(entryId: string) {
  return prisma.entry.delete({
    where: { id: entryId },
  });
}

// Export entries to CSV
export async function exportEntriesToCSV(
  userId: string,
  filters?: {
    categoryId?: string;
    placeId?: string;
    month?: string;
    year?: string;
  }
) {
  const where: Prisma.EntryWhereInput = { userId };
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.placeId) where.placeId = filters.placeId;

  // Month & Year filter logic
  if (filters?.month) {
    const year = filters?.year
      ? Number(filters.year)
      : new Date().getFullYear();
    const monthNum = Number(filters.month);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);
    where.date = { gte: start, lt: end };
  } else if (filters?.year) {
    const year = Number(filters.year);
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    where.date = { gte: start, lt: end };
  }

  const entries = await prisma.entry.findMany({
    where,
    include: { category: true, place: true },
    orderBy: { date: "desc" },
  });

  // CSV header
  let csv = "Date,Type,Amount,Category,Place,Description\n";
  csv += entries
    .map(
      (e) =>
        `"${e.date.toISOString().slice(0, 10)}","${e.type}",${e.amount},"${
          e.category?.name || ""
        }","${e.place?.name || ""}","${e.description || ""}"`
    )
    .join("\n");

  return csv;
}

// Import entries from CSV
export async function importEntries(rows: Record<string, string>[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  function clean(val: string | undefined): string | undefined {
    if (typeof val !== "string") return val;
    let s = val.replace(/^\uFEFF/, "").trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1);
    }
    s = s.replace(/""/g, '"');
    s = s.replace(/,+$/, "");
    if (s === "" || s === '""') return undefined;
    return s;
  }

  try {
    for (const row of rows as Record<string, string>[]) {
      // Defensive: handle BOM, whitespace, Excel quirks, and extra quotes
      const DateVal = clean(row.Date) || clean(row["\uFEFFDate"]);
      const TypeVal = clean(row.Type);
      const AmountVal = clean(row.Amount);
      const CategoryVal = clean(row.Category);
      const PlaceVal = clean(row.Place);
      const DescriptionVal = clean(row.Description);

      if (!DateVal || !TypeVal || !AmountVal || !CategoryVal) continue;

      // Find or create category
      let category = await prisma.category.findUnique({
        where: { name: CategoryVal },
      });
      if (!category) {
        category = await prisma.category.create({
          data: { name: CategoryVal },
        });
      }

      // Find or create place if provided
      let placeId: string | undefined = undefined;
      if (PlaceVal) {
        let place = await prisma.place.findUnique({
          where: { name: PlaceVal },
        });
        if (!place) {
          place = await prisma.place.create({
            data: { name: PlaceVal },
          });
        }
        placeId = place.id;
      }

      await prisma.entry.create({
        data: {
          userId: session.user.id,
          date: new Date(DateVal),
          type: TypeVal as EntryType,
          amount: Number(AmountVal),
          categoryId: category.id,
          placeId,
          description: DescriptionVal || "",
        },
      });
    }
    revalidatePath("/dashboard/entries");
    return { success: true };
  } catch (error) {
    console.error("Error importing entries:", error);
    return { success: false };
  }
}

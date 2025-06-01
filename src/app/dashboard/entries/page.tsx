import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { getCategories, getPlaces, getPaginatedEntries } from "@/lib/actions";
import DashboardFilterBar from "@/components/DashboardFilterBar";
import EntryList from "@/components/EntryList";
import ExportCsvButton from "@/components/ExportCsvButton";
import ImportCsvButton from "@/components/ImportCsvButton";
import { ToastProvider } from "@/components/ToastContext";
import Toast from "@/components/Toast";

export default async function EntriesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    categoryId?: string;
    placeId?: string;
    date?: string;
    month?: string;
    year?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;

  const categories = await getCategories();
  const places = await getPlaces();

  const page = Number(params?.page) || 1;
  const filters = {
    ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params?.placeId ? { placeId: params.placeId } : {}),
    ...(params?.month ? { month: params.month } : {}),
    ...(params?.year ? { year: params.year } : {}),
  };

  const { entries, totalPages } = await getPaginatedEntries(session.user.id, {
    page,
    pageSize: 10,
    filters,
  });

  // Build export URL with current filters
  function buildExportUrl() {
    const params = new URLSearchParams(filters as Record<string, string>);
    return `/api/entries/export${
      params.toString() ? "?" + params.toString() : ""
    }`;
  }

  return (
    
      <main className="min-h-screen p-8 bg-gray-900 text-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold mb-6">All Entries</h1>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <ImportCsvButton />
            <ExportCsvButton exportUrl={buildExportUrl()} />
          </div>
        </div>
        <DashboardFilterBar
          categories={categories}
          places={places}
          initial={filters}
          basePath="/dashboard/entries"
        />

        {/* Entry List */}
        <EntryList
          entries={entries.map((entry) => ({
            ...entry,
            date:
              entry.date instanceof Date ? entry.date.toISOString() : entry.date,
          }))}
        />

        {/* Pagination */}
        <div className="flex gap-2 mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            filters={filters}
          />
        </div>
        <Toast />
      </main>
  );
}

// Simple Pagination component
function Pagination({
  currentPage,
  totalPages,
  filters,
}: {
  currentPage: number;
  totalPages: number;
  filters: Record<string, string>;
}) {
  function buildQuery(page: number) {
    const params = new URLSearchParams({ ...filters, page: String(page) });
    return `?${params.toString()}`;
  }
  return (
    <div className="flex gap-2">
      <a
        href={buildQuery(currentPage - 1)}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        aria-disabled={currentPage === 1}
      >
        Prev
      </a>
      <span className="px-3 py-1">
        {currentPage} / {totalPages}
      </span>
      <a
        href={buildQuery(currentPage + 1)}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        aria-disabled={currentPage === totalPages}
      >
        Next
      </a>
    </div>
  );
}

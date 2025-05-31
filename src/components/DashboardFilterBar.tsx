"use client";

import { useRouter } from "next/navigation";
import DashboardFilters from "@/components/DashboardFilters";

export default function DashboardFilterBar({
  categories,
  places,
  initial,
  basePath = "/dashboard", // default to /dashboard
}: {
  categories: { id: string; name: string }[];
  places: { id: string; name: string }[];
  initial: {
    categoryId?: string;
    placeId?: string;
    month?: string;
    year?: string;
  };
  basePath?: string;
}) {
  const router = useRouter();

  function buildQueryString(obj: Record<string, string>) {
    const params = Object.entries(obj)
      .filter(([, v]) => v && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    return params ? `?${params}` : "";
  }

  function handleDone() {}

  return (
    <DashboardFilters
      categories={categories}
      places={places}
      initial={initial}
      onFilter={(f) => {
        const cleaned = Object.fromEntries(
          Object.entries(f).filter(([, v]) => v && v !== "")
        );
        const query = buildQueryString(cleaned);
        if (query) {
          router.push(`${basePath}${query}`);
        } else {
          router.push(basePath);
        }
        handleDone();
      }}
      onDone={handleDone}
    />
  );
}

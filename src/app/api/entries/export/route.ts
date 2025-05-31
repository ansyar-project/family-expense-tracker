import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { exportEntriesToCSV } from "@/lib/actions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = {
    page: searchParams.get("page") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    placeId: searchParams.get("placeId") || undefined,
    date: searchParams.get("date") || undefined,
    month: searchParams.get("month") || undefined,
    year: searchParams.get("year") || undefined,
  };

  const csv = await exportEntriesToCSV(session.user.id, filters);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=entries.csv",
    },
  });
}
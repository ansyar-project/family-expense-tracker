import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import AddEntryForm from "@/components/AddEntryForm";

export default async function AddEntryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Fetch categories and places for the form
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  const places = await prisma.place.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex min-h-screen items-center justify-center ml-0 md:ml-64">
      <div className="max-w-xl w-full bg-gray-800 p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Add New Entry</h1>
        <AddEntryForm
          userId={session.user.id}
          categories={categories}
          places={places}
        />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 md:ml-64">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 text-center w-12 border-b-2 border-blue-500"></div>
        <span className="text-lg text-center">Loading dashboard...</span>
      </div>
    </main>
  );
}
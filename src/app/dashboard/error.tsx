"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-red-200">
      <div className="bg-gray-800 rounded-lg p-8 shadow flex flex-col items-center gap-4">
        <span className="text-2xl font-bold">Something went wrong!</span>
        <span className="text-lg">{error.message || "An unexpected error occurred while loading your dashboard."}</span>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
          onClick={() => reset()}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
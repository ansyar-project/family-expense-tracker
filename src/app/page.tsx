// import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100">
      <h1 className="text-4xl font-bold mb-4">Family Expense Tracker</h1>
      <p className="mb-8 text-lg text-gray-300">
        Track your family&apos;s income and expenses easily. Visualize your spending, set budgets, and stay on top of your finances.
      </p>
      <a
        href="/login"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition"
      >
        Get Started
      </a>
    </main>
  );
}

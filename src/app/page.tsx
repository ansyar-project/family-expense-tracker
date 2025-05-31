// import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
          Family Expense Tracker
        </h1>
        <p className="mb-8 text-base sm:text-lg text-gray-300 text-center">
          Track your family&apos;s income and expenses easily. Visualize your
          spending, set budgets, and stay on top of your finances.
        </p>
        <a
          href="/login"
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition text-center"
        >
          Get Started
        </a>
      </div>
    </main>
  );
}

import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/ToastContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-900 text-gray-100">
        <Sidebar />
        <main className="min-h-screen p-4 md:p-8 bg-gray-900 text-gray-100 ml-0 md:ml-64 transition-all duration-300">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
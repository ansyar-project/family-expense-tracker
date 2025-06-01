"use client";
import React from "react";
import { useToast } from "./ToastContext";

export default function ExportCsvButton({ exportUrl }: { exportUrl: string }) {
  const { setToast } = useToast();

  async function handleExport() {
    try {
      const res = await fetch(exportUrl);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "entries.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToast({ message: "Export successful!", type: "success" });
    } catch (e) {
      setToast({ message: "Export failed.", type: "error" });
    }
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-center w-full md:w-auto"
    >
      Export CSV
    </button>
  );
}

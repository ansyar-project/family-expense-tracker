"use client";
import React, { useState } from "react";
import Toast from "./Toast";

export default function ExportCsvButton({ exportUrl }: { exportUrl: string }) {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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
      console.error("Export error:", e);
      setToast({ message: "Export failed.", type: "error" });
    }
  }

  return (
    <>
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-center w-full md:w-auto"
      >
        Export CSV
      </button>
      <Toast
        message={toast?.message || ""}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </>
  );
}

"use client";
import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { importEntries } from "@/lib/actions";
import { useToast } from "./ToastContext";

export default function ImportCsvModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { setToast } = useToast();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^\uFEFF/, ""), // Remove BOM and trim
      complete: async (results) => {
        let cleanedRows = results.data;

        // Detect Excel-mangled CSV: only one key per row, and that key contains commas
        if (
          cleanedRows.length &&
          Object.keys(cleanedRows[0]).length === 1 &&
          Object.keys(cleanedRows[0])[0].includes(",")
        ) {
          // Re-parse as array mode
          Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: async (arrayResults) => {
              const rawRows = arrayResults.data as string[][];
              // Parse every row string (including header) with PapaParse
              const parsedRows = rawRows.map((row) =>
                typeof row[0] === "string"
                  ? Papa.parse(row[0], { header: false }).data[0]
                  : row
              );
              const [headerRow, ...dataRows] = parsedRows;
              const cleanedRows = dataRows.map((row: any[]) =>
                headerRow.reduce((acc: any, key: string, idx: number) => {
                  acc[key.trim().replace(/^\uFEFF/, "")] =
                    typeof row[idx] === "string"
                      ? row[idx].trim().replace(/^"|"$/g, "")
                      : row[idx];
                  return acc;
                }, {})
              );
              // Now cleanedRows is in the correct format
              const res = await importEntries(cleanedRows);
              if (res.success) {
                setToast({ message: "Import successful!", type: "success" });
                onClose();
              } else {
                setToast({ message: "Import failed.", type: "error" });
              }
              setLoading(false);
            },
          });
          return;
        }

        // Normal case
        const res = await importEntries(cleanedRows);
        if (res.success) {
          setToast({ message: "Import successful!", type: "success" });
          onClose();
        } else {
          setToast({ message: "Import failed.", type: "error" });
        }
        setLoading(false);
      },
      error: () => {
        setToast({ message: "CSV parse error.", type: "error" });
        setLoading(false);
      },
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded shadow-lg p-6 w-full max-w-sm border border-gray-700">
        <h2 className="text-lg font-bold mb-4 text-gray-100">
          Import Entries from CSV
        </h2>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="mb-4 block w-full text-gray-100 file:bg-gray-800 file:text-gray-100 file:border-none file:rounded file:px-3 file:py-1"
          disabled={loading}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-700 text-gray-100 hover:bg-gray-600 transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

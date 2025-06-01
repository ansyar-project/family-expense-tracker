"use client";
import React, { useState } from "react";
import ImportCsvModal from "@/components/ImportCsvModal";

export default function ImportCsvButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white"
        onClick={() => setModalOpen(true)}
      >
        Import CSV
      </button>
      <ImportCsvModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

"use client";
import React from "react";
import { useToast } from "./ToastContext";

export default function Toast() {
  const { toast, setToast } = useToast();
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 flex items-center
        ${
          toast.type === "success"
            ? "bg-green-700 text-white"
            : "bg-red-700 text-white"
        }`}
    >
      <span>{toast.message}</span>
      <button className="ml-4" onClick={() => setToast(null)}>
        ✕
      </button>
    </div>
  );
}

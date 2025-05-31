import React from "react";

export default function Toast({
  message,
  onClose,
  type = "success",
}: {
  message: string;
  onClose: () => void;
  type?: "success" | "error";
}) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow-lg z-50 flex items-center
        ${type === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"}`}
    >
      <span>{message}</span>
      <button className="ml-4" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
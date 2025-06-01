"use client";
import React, { createContext, useContext, useState } from "react";

type ToastType = { message: string; type: "success" | "error" } | null;

const ToastContext = createContext<{
  toast: ToastType;
  setToast: (toast: ToastType) => void;
}>({
  toast: null,
  setToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastType>(null);
  return (
    <ToastContext.Provider value={{ toast, setToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
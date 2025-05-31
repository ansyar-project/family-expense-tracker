"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FaHome,
  FaPlusCircle,
  FaListAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: <FaHome /> },
  { href: "/dashboard/entries", label: "All Entries", icon: <FaListAlt /> },
  { href: "/dashboard/add", label: "Add New Entry", icon: <FaPlusCircle /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger for mobile (top right) */}
      <button
        className="fixed top-4 right-4 z-50 md:hidden bg-gray-900 p-2 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars className="text-white h-6 w-6" />
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-gray-950 text-gray-100 flex flex-col shadow-lg z-50
          transition-transform duration-300
          -translate-x-full
          md:translate-x-0
          ${open ? "translate-x-0" : ""}
        `}
        style={{ maxWidth: "100vw" }}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <span className="text-2xl font-bold tracking-wide">
            Family Expense
          </span>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded transition ${
                pathname === item.href
                  ? "bg-blue-700 text-white"
                  : "hover:bg-gray-800"
              }`}
              onClick={() => setOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white transition"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

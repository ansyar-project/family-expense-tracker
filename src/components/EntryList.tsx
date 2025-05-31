"use client";
import React, { useState, useEffect } from "react";
import { editEntry, deleteEntry, getCategories, getPlaces } from "@/lib/actions";

export interface Entry {
  id: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: { name: string };
  place?: { name: string } | null;
  description?: string | null;
}

interface EntryListProps {
  entries: Entry[];
}

type EntryForm = {
  amount: number | string;
  categoryName: string;
  placeName: string;
  date: string;
  description?: string;
  type: "INCOME" | "EXPENSE";
};

const EntryList: React.FC<EntryListProps> = ({ entries }) => {
  const [editTarget, setEditTarget] = useState<Entry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);
  const [form, setForm] = useState<EntryForm>({
    amount: "",
    categoryName: "",
    placeName: "",
    date: "",
    description: "",
    type: "EXPENSE",
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ name: string }[]>([]);
  const [places, setPlaces] = useState<{ name: string }[]>([]);
  // const [newCategory, setNewCategory] = useState("");
  // const [newPlace, setNewPlace] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewPlace, setShowNewPlace] = useState(false);

  // Fetch categories and places when edit modal opens
  useEffect(() => {
    if (editTarget) {
      getCategories().then(setCategories);
      getPlaces().then(setPlaces);
    }
  }, [editTarget]);

  // Handle edit form open
  const openEdit = (entry: Entry) => {
    setEditTarget(entry);
    setForm({
      amount: entry.amount,
      categoryName: entry.category?.name || "",
      placeName: entry.place?.name || "",
      date: entry.date ? entry.date.slice(0, 10) : "",
      description: entry.description || "",
      type: entry.type,
    });
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (!editTarget) return;
    setLoading(true);
    await editEntry(editTarget.id, {
      ...form,
      amount: Number(form.amount),
      date: form.date ? new Date(form.date) : undefined,
    });
    setLoading(false);
    setEditTarget(null);
    window.location.reload(); // Or trigger a re-fetch if using SWR/React Query
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    await deleteEntry(deleteTarget.id);
    setLoading(false);
    setDeleteTarget(null);
    window.location.reload(); // Or trigger a re-fetch if using SWR/React Query
  };

  return (
    <div className="overflow-x-auto mt-8">
      <table className="min-w-full bg-gray-800 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">Amount</th>
            <th className="px-4 py-2 text-left">Place</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-400">
                No entries found.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className="border-t border-gray-700">
                <td className="px-4 py-2">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={
                      entry.type === "INCOME"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {entry.type}
                  </span>
                </td>
                <td className="px-4 py-2">{entry.category?.name}</td>
                <td className="px-4 py-2">
                  {entry.type === "EXPENSE" ? "-" : "+"}
                  {entry.amount.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>
                <td className="px-4 py-2">{entry.place?.name || "-"}</td>
                <td className="px-4 py-2">{entry.description || "-"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    onClick={() => openEdit(entry)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                    onClick={() => setDeleteTarget(entry)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-gray-100">Edit Entry</h2>
            {/* Amount */}
            <div className="mb-2">
              <label className="block text-sm mb-1 text-gray-300">Amount</label>
              <input
                className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            {/* Category */}
            <div className="mb-2">
              <label className="block text-sm mb-1 text-gray-300">Category</label>
              <div className="flex gap-2">
                <select
                  className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded p-2"
                  value={showNewCategory ? "" : form.categoryName}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setShowNewCategory(true);
                      setForm({ ...form, categoryName: "" });
                    } else {
                      setShowNewCategory(false);
                      setForm({ ...form, categoryName: e.target.value });
                    }
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__new__">+ Add new category</option>
                </select>
                {showNewCategory && (
                  <input
                    className="w-full border border-blue-700 bg-gray-800 text-gray-100 rounded p-2"
                    placeholder="New category"
                    value={form.categoryName}
                    onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                  />
                )}
              </div>
            </div>
            {/* Place */}
            <div className="mb-2">
              <label className="block text-sm mb-1 text-gray-300">Place</label>
              <div className="flex gap-2">
                <select
                  className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded p-2"
                  value={showNewPlace ? "" : form.placeName}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setShowNewPlace(true);
                      setForm({ ...form, placeName: "" });
                    } else {
                      setShowNewPlace(false);
                      setForm({ ...form, placeName: e.target.value });
                    }
                  }}
                >
                  <option value="">Select place</option>
                  {places.map((pl) => (
                    <option key={pl.name} value={pl.name}>
                      {pl.name}
                    </option>
                  ))}
                  <option value="__new__">+ Add new place</option>
                </select>
                {showNewPlace && (
                  <input
                    className="w-full border border-blue-700 bg-gray-800 text-gray-100 rounded p-2"
                    placeholder="New place"
                    value={form.placeName}
                    onChange={(e) => setForm({ ...form, placeName: e.target.value })}
                  />
                )}
              </div>
            </div>
            {/* Date */}
            <div className="mb-2">
              <label className="block text-sm mb-1 text-gray-300">Date</label>
              <input
                className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            {/* Description */}
            <div className="mb-2">
              <label className="block text-sm mb-1 text-gray-300">Description</label>
              <input
                className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            {/* Type */}
            <div className="mb-2">
              <label className="block text-sm mb-1 text-gray-300">Type</label>
              <select
                className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "INCOME" | "EXPENSE" })}
              >
                <option value="INCOME">INCOME</option>
                <option value="EXPENSE">EXPENSE</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                onClick={handleEditSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded transition"
                onClick={() => setEditTarget(null)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm shadow-2xl border border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-gray-100">Delete Entry</h2>
            <p className="text-gray-300">Are you sure you want to delete this entry?</p>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded transition"
                onClick={() => setDeleteTarget(null)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryList;

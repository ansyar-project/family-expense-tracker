"use client";

import { useState } from "react";
import { addEntry } from "@/lib/actions";
// import { useRouter } from "next/navigation";
import { FaMoneyBillWave, FaTags, FaMapMarkerAlt, FaCalendarAlt, FaStickyNote } from "react-icons/fa";
import { useToast } from "./ToastContext"; // Use the toast context

export default function AddEntryForm({ userId, categories, places }: {
  userId: string;
  categories: { id: string; name: string }[];
  places: { id: string; name: string }[];
}) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [categoryName, setCategoryName] = useState(categories[0]?.name || "");
  const [newCategory, setNewCategory] = useState("");
  const [placeName, setPlaceName] = useState(places[0]?.name || "");
  const [newPlace, setNewPlace] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setToast } = useToast(); // <-- Use setToast from context

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addEntry({
        userId,
        type,
        amount: parseFloat(amount),
        categoryName: newCategory || categoryName,
        placeName: newPlace || placeName || undefined,
        date: new Date(date),
        description,
      });
      setToast({ message: "Entry added successfully!", type: "success" }); // <-- show toast
      setAmount("");
      setCategoryName(categories[0]?.name || "");
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");
      setNewCategory("");
      setPlaceName(places[0]?.name || "");
      setNewPlace("");
    } catch (err) {
      console.error("Failed to add entry:", err);
      setError("Failed to add entry.");
      setToast({ message: "Failed to add entry.", type: "error" }); // <-- show error toast
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-4 mb-2">
        <label className={`flex items-center gap-2 px-4 py-2 rounded cursor-pointer transition ${type === "EXPENSE" ? "bg-red-700 text-white" : "bg-gray-800 text-gray-300"}`}>
          <input
            type="radio"
            name="type"
            value="EXPENSE"
            checked={type === "EXPENSE"}
            onChange={() => setType("EXPENSE")}
            className="hidden"
          />
          <FaMoneyBillWave />
          Expense
        </label>
        <label className={`flex items-center gap-2 px-4 py-2 rounded cursor-pointer transition ${type === "INCOME" ? "bg-green-700 text-white" : "bg-gray-800 text-gray-300"}`}>
          <input
            type="radio"
            name="type"
            value="INCOME"
            checked={type === "INCOME"}
            onChange={() => setType("INCOME")}
            className="hidden"
          />
          <FaMoneyBillWave />
          Income
        </label>
      </div>
      <div className="relative">
        <FaMoneyBillWave className="absolute left-3 top-3 text-gray-400" />
        <input
          type="number"
          placeholder="Amount"
          className="w-full pl-10 p-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-600"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Category</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaTags className="absolute left-3 top-3 text-gray-400" />
            <select
              className="w-full pl-10 h-10 text-base p-2 rounded bg-gray-900 border border-gray-700 text-gray-100 mb-2 focus:ring-2 focus:ring-blue-600"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              disabled={!!newCategory}
              required={!newCategory}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Or add new"
            className="flex-1 h-10 text-base p-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-600"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Place</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
            <select
              className="w-full pl-10 h-10 text-base p-2 rounded bg-gray-900 border border-gray-700 text-gray-100 mb-2 focus:ring-2 focus:ring-blue-600"
              value={placeName}
              onChange={e => setPlaceName(e.target.value)}
              disabled={!!newPlace}
            >
              <option value="">No Place</option>
              {places.map(place => (
                <option key={place.id} value={place.name}>{place.name}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Or add new"
            className="flex-1 h-10 text-base p-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-600"
            value={newPlace}
            onChange={e => setNewPlace(e.target.value)}
          />
        </div>
      </div>
      <div className="relative">
        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
        <input
          type="date"
          className="w-full pl-10 p-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-600"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>
      <div className="relative">
        <FaStickyNote className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Description (optional)"
          className="w-full pl-10 p-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-600"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      {error && <div className="text-red-400">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold shadow transition"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Entry"}
      </button>
    </form>
  );
}
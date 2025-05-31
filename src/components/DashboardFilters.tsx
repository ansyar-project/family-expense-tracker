"use client";

import { useState, useEffect } from "react";
import { FaFilter, FaTags, FaMapMarkerAlt, FaUndo } from "react-icons/fa";

const months = [
	{ value: "", label: "All" },
	{ value: "01", label: "January" },
	{ value: "02", label: "February" },
	{ value: "03", label: "March" },
	{ value: "04", label: "April" },
	{ value: "05", label: "May" },
	{ value: "06", label: "June" },
	{ value: "07", label: "July" },
	{ value: "08", label: "August" },
	{ value: "09", label: "September" },
	{ value: "10", label: "October" },
	{ value: "11", label: "November" },
	{ value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => ({
	value: String(currentYear - i),
	label: String(currentYear - i),
}));

export default function DashboardFilters({
	categories,
	places,
	initial,
	onFilter,
	onDone,
}: {
	categories: { id: string; name: string }[];
	places: { id: string; name: string }[];
	initial?: { categoryId?: string; placeId?: string; month?: string; year?: string };
	onFilter: (filters: { categoryId?: string; placeId?: string; month?: string; year?: string }) => void;
	onDone?: () => void;
}) {
	const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
	const [placeId, setPlaceId] = useState(initial?.placeId || "");
	const [month, setMonth] = useState(initial?.month || "");
	const [year, setYear] = useState(initial?.year || String(currentYear));
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (onDone) {
			setLoading(false);
		}
	}, [onDone]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		onFilter({ categoryId, placeId, month, year });
		// Don't setLoading(false) here!
		// Wait for parent to call onDone
	}

	function handleReset() {
		setCategoryId("");
		setPlaceId("");
		setMonth("");
		setYear(String(currentYear));
		setLoading(true);
		onFilter({ categoryId: "", placeId: "", month: "", year: "" });
	}

	return (
		<form
			className="flex flex-wrap gap-4 mb-8 items-end bg-gray-800 p-4 rounded-lg shadow"
			onSubmit={handleSubmit}
		>
			{/* Category */}
			<div className="flex flex-col min-w-[150px]">
				<label className="text-xs mb-1 text-gray-400">Category</label>
				<div className="relative flex items-center">
					<FaTags className="absolute left-3 text-gray-400 h-4 w-4 pointer-events-none" />
					<select
						className="pl-9 pr-2 py-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-600 w-full"
						value={categoryId}
						onChange={e => setCategoryId(e.target.value)}
					>
						<option value="">All</option>
						{categories.map(cat => (
							<option key={cat.id} value={cat.id}>{cat.name}</option>
						))}
					</select>
				</div>
			</div>
			{/* Place */}
			<div className="flex flex-col min-w-[150px]">
				<label className="text-xs mb-1 text-gray-400">Place</label>
				<div className="relative flex items-center">
					<FaMapMarkerAlt className="absolute left-3 text-gray-400 h-4 w-4 pointer-events-none" />
					<select
						className="pl-9 pr-2 py-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-600 w-full"
						value={placeId}
						onChange={e => setPlaceId(e.target.value)}
					>
						<option value="">All</option>
						{places.map(place => (
							<option key={place.id} value={place.id}>{place.name}</option>
						))}
					</select>
				</div>
			</div>
			{/* Month */}
			<div className="flex flex-col min-w-[150px]">
				<label className="text-xs mb-1 text-gray-400">Month</label>
				<div className="relative flex items-center">
					<select
						className="pl-3 pr-2 py-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-600 w-full"
						value={month}
						onChange={e => setMonth(e.target.value)}
					>
						{months.map(m => (
							<option key={m.value} value={m.value}>{m.label}</option>
						))}
					</select>
				</div>
			</div>
			{/* Year */}
			<div className="flex flex-col min-w-[100px]">
				<label className="text-xs mb-1 text-gray-400">Year</label>
				<select
					className="pl-3 pr-2 py-2 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-600 w-full"
					value={year}
					onChange={e => setYear(e.target.value)}
				>
					{years.map(y => (
						<option key={y.value} value={y.value}>{y.label}</option>
					))}
				</select>
			</div>
			{/* Filter Button */}
			<button
				type="submit"
				className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition min-h-[40px]"
				disabled={loading}
			>
				{loading ? (
					<span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
				) : (
					<>
						<FaFilter />
						Filter
					</>
				)}
			</button>
			{/* Reset Button */}
			<button
				type="button"
				onClick={handleReset}
				className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded shadow transition min-h-[40px]"
			>
				<FaUndo />
				Reset
			</button>
		</form>
	);
}
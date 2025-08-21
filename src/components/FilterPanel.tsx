import React from "react";
import { useTasks } from "../context/TaskContext";
import { Category } from "../types";

const CATEGORIES: Category[] = ["To Do", "In Progress", "Review", "Completed"];

export default function FilterPanel() {
  const { filters, setFilters, resetTasks } = useTasks();

  const toggleCat = (c: Category) =>
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));

  return (
    <div className="bg-white p-4 rounded-xl shadow border w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <h3 className="font-semibold text-lg sm:text-xl">Filters</h3>

      {/* Search Bar */}
      <input
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        className="w-full border p-2 rounded mt-3 text-sm sm:text-base"
      />

      {/* Categories */}
      <div className="mt-4">
        <div className="font-medium text-sm sm:text-base">Category</div>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-1 gap-2">
          {CATEGORIES.map((c) => (
            <label
              key={c}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(c)}
                onChange={() => toggleCat(c)}
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mt-4">
        <div className="font-medium text-sm sm:text-base">Duration</div>
        <div className="mt-2 space-y-1">
          {[1, 2, 3].map((w) => (
            <label
              key={w}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              <input
                type="radio"
                name="dur"
                checked={filters.durationWeeks === w}
                onChange={() => setFilters((f) => ({ ...f, durationWeeks: w }))}
              />
              <span>
                Within {w} week{w > 1 ? "s" : ""}
              </span>
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm sm:text-base">
            <input
              type="radio"
              name="dur"
              checked={filters.durationWeeks === null}
              onChange={() =>
                setFilters((f) => ({ ...f, durationWeeks: null }))
              }
            />
            <span>All</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          className="px-3 py-2 border rounded text-sm sm:text-base w-full sm:w-auto"
          onClick={() =>
            setFilters({ categories: [], durationWeeks: null, search: "" })
          }
        >
          Reset Filters
        </button>
        <button
          className="px-3 py-2 border rounded text-sm sm:text-base w-full sm:w-auto"
          onClick={resetTasks}
        >
          Clear Tasks
        </button>
      </div>
    </div>
  );
}

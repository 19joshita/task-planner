import React from "react";
import { useTasks } from "../context/TaskContext";
import { Category } from "../types";

const catList: Category[] = ["To Do", "In Progress", "Review", "Completed"];

export const FiltersBar: React.FC = () => {
  const { filters, setFilters } = useTasks();

  const toggleCat = (c: Category) =>
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));

  return (
    <div className="mb-4 grid gap-3 rounded-2xl border bg-white p-3 shadow-sm md:grid-cols-3">
      {/* Search */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Search by name
        </label>
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Type to search..."
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
        />
      </div>

      {/* Category Filters */}
      <div>
        <div className="block text-sm text-gray-600 mb-1">Categories</div>
        <div className="flex flex-wrap gap-3">
          {catList.map((c) => (
            <label key={c} className="inline-flex items-center gap-2">
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

      {/* Time Filter */}
      <div>
        <div className="block text-sm text-gray-600 mb-1">Time window</div>
        <div className="flex flex-wrap gap-3">
          {([0, 1, 2, 3] as const).map((w) => (
            <label key={w} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="weeks"
                checked={w === filters.weeks}
                onChange={() => setFilters((f) => ({ ...f, weeks: w }))}
              />
              <span>{w === 0 ? "All" : `${w} week${w > 1 ? "s" : ""}`}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

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
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold">Filters</h3>
      <input
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        className="w-full border p-2 rounded mt-3"
      />

      <div className="mt-4">
        <div className="font-medium">Category</div>
        <div className="mt-2 space-y-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2">
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

      <div className="mt-4">
        <div className="font-medium">Duration</div>
        <div className="mt-2 space-y-1">
          {[1, 2, 3].map((w) => (
            <label key={w} className="flex items-center gap-2">
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
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="dur"
              checked={filters.durationWeeks === null}
              onChange={() =>
                setFilters((f) => ({ ...f, durationWeeks: null }))
              }
            />{" "}
            <span>All</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded"
          onClick={() =>
            setFilters({ categories: [], durationWeeks: null, search: "" })
          }
        >
          Reset Filters
        </button>
        <button className="px-3 py-1 border rounded" onClick={resetTasks}>
          Clear Tasks
        </button>
      </div>
    </div>
  );
}

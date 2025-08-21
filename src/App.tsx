import React from "react";
import Calendar from "./components/Calender";
import FilterPanel from "./components/FilterPanel";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        <aside className="col-span-3">
          <FilterPanel />
        </aside>
        <main className="col-span-9 bg-white p-4 rounded-xl shadow">
          <Calendar />
        </main>
      </div>
    </div>
  );
}

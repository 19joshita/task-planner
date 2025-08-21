import React from "react";
import Calendar from "./components/Calender";
import FilterPanel from "./components/FilterPanel";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 w-full ">
      <h1 className="text-[24px] text-black-700 text-center p-3 font-medium bg-blue-700 text-white">
        Month View Task Planner
      </h1>
      <div className="max-w-7xl mx-auto grid sm:grid-cols-12 gap-6 p-4">
        <aside className="sm:col-span-3">
          <FilterPanel />
        </aside>
        <main className="sm:col-span-9 bg-white p-4 rounded-xl shadow">
          <Calendar />
        </main>
      </div>
    </div>
  );
}

import React from "react";
import { TaskProvider } from "./context/TaskContext";
import { FiltersBar } from "./components/Filters";
import { Calendar } from "./components/Calender";

const App: React.FC = () => {
  return (
    <TaskProvider>
      <div className="mx-auto max-w-6xl p-4">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Month View Task Planner</h1>
          <div className="text-sm text-gray-500">
            React + TS + Tailwind + dnd-kit
          </div>
        </header>
        <FiltersBar />
        <Calendar />
        <footer className="mt-6 text-center text-xs text-gray-500">
          No backend · LocalStorage enabled · Resize/move/create via drag
        </footer>
      </div>
    </TaskProvider>
  );
};
export default App;

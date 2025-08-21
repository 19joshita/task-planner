import React, { createContext, useContext, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { TaskItem, Category, FiltersState } from "../types";
import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface TaskContextValue {
  tasks: TaskItem[];
  addTask: (t: Omit<TaskItem, "id">) => void;
  updateTask: (id: string, patch: Partial<TaskItem>) => void;
  moveTaskByDays: (id: string, deltaDays: number) => void;
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
};

const sample: TaskItem[] = [
  {
    id: nanoid(),
    name: "Design landing",
    category: "To Do",
    start: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    end: format(addDays(new Date(), 3), "yyyy-MM-dd"),
  },
  {
    id: nanoid(),
    name: "API integration",
    category: "In Progress",
    start: format(addDays(new Date(), 4), "yyyy-MM-dd"),
    end: format(addDays(new Date(), 6), "yyyy-MM-dd"),
  },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Toggle between local storage persistence or pure memory by switching the next line
  const [tasks, setTasks] = useLocalStorage<TaskItem[]>(
    "tasks@month-planner",
    sample
  );
  // const [tasks, setTasks] = useState<TaskItem[]>(sample);

  const [filters, setFilters] = useState<FiltersState>({
    categories: [],
    weeks: 0,
    search: "",
  });

  const addTask = (t: Omit<TaskItem, "id">) =>
    setTasks((ts) => [{ ...t, id: nanoid() }, ...ts]);
  const updateTask = (id: string, patch: Partial<TaskItem>) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const moveTaskByDays = (id: string, deltaDays: number) =>
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        const s = parseISO(t.start);
        const e = parseISO(t.end);
        const ns = addDays(s, deltaDays);
        const ne = addDays(e, deltaDays);
        return {
          ...t,
          start: format(ns, "yyyy-MM-dd"),
          end: format(ne, "yyyy-MM-dd"),
        };
      })
    );

  const value = useMemo(
    () => ({
      tasks,
      addTask,
      updateTask,
      moveTaskByDays,
      setTasks,
      filters,
      setFilters,
    }),
    [tasks, filters]
  );
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

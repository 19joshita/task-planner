import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { differenceInCalendarDays } from "date-fns";
import { Category } from "../types";

export interface Task {
  id: string;
  name: string;
  category: Category;
  start: string; // ISO day
  end: string; // ISO day (inclusive)
}

interface Filters {
  categories: Category[];
  durationWeeks: number | null;
  search: string;
}

interface TaskContextProps {
  tasks: Task[];
  addTask: (t: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredTasks: Task[];
  resetTasks: () => void;
}
const TaskContext = createContext<TaskContextProps | undefined>(undefined);
const LS_KEY = "mtp_tasks_v2";

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const [filters, setFilters] = useState<Filters>({
    categories: [],
    durationWeeks: null,
    search: "",
  });

  const addTask = (t: Task) => setTasks((s) => [...s, t]);
  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const deleteTask = (id: string) =>
    setTasks((s) => s.filter((x) => x.id !== id));
  const resetTasks = () => setTasks([]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.categories.length && !filters.categories.includes(t.category))
        return false;
      if (
        filters.search &&
        !t.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.durationWeeks) {
        const days =
          differenceInCalendarDays(new Date(t.end), new Date(t.start)) + 1;
        if (days > filters.durationWeeks * 7) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        filters,
        setFilters,
        filteredTasks,
        resetTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used inside TaskProvider");
  return ctx;
};

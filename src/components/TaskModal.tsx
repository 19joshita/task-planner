import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Task, useTasks } from "../context/TaskContext";
import { Category } from "../types";

const CATEGORIES: Category[] = ["To Do", "In Progress", "Review", "Completed"];

interface Props {
  open: boolean;
  startIso: string;
  endIso: string;
  onClose: () => void;
  editTask?: Task | null;
}
export default function TaskModal({
  open,
  startIso,
  endIso,
  onClose,
  editTask,
}: Props) {
  const { addTask, updateTask } = useTasks();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("To Do");

  useEffect(() => {
    if (editTask) {
      setName(editTask.name);
      setCategory(editTask.category);
    } else {
      setName("");
      setCategory("To Do");
    }
  }, [editTask, open]);

  if (!open) return null;

  const onSave = () => {
    if (!name.trim()) {
      alert("Please enter task name");
      return;
    }
    if (editTask) {
      updateTask(editTask.id, { name, category, start: startIso, end: endIso });
    } else {
      addTask({ id: uuidv4(), name, category, start: startIso, end: endIso });
    }
    onClose();
  };
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-4 w-96 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">
          {editTask ? "Edit Task" : "Create Task"}
        </h3>
        <label className="block text-sm mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
        <label className="block text-sm mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full border p-2 rounded mb-4"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded border" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

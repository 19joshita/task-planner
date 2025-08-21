import React from "react";
import { Task } from "../context/TaskContext";
import { Category } from "../types";

const COLORS: Record<Category, string> = {
  "To Do": "bg-yellow-300",
  "In Progress": "bg-blue-300",
  Review: "bg-purple-300",
  Completed: "bg-green-300",
};

interface Props {
  task: Task;
  style?: React.CSSProperties;
  onDragStart?: (e: React.DragEvent) => void;
  onClick?: () => void;
}

export default function TaskBar({ task, style, onDragStart, onClick }: Props) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={style}
      title={`${task.name} • ${task.category}`} // tooltip
      className={`rounded px-2 py-1 text-xs truncate cursor-pointer shadow-sm ${
        COLORS[task.category]
      }`}
    >
      {task.name}
    </div>
  );
}

import React from "react";
import { Task } from "../context/TaskContext";

interface Props {
  idx: number;
  dateIso: string;
  dayNumber: number;
  tasks: Task[];
  isSelected: boolean;
  onCellMouseDown: (e: React.MouseEvent, idx: number) => void;
  onCellEnter: (idx: number) => void;
  onDropTask: (taskId: string, targetIdx: number) => void;
}

export default function DayCell({
  idx,
  dateIso,
  dayNumber,
  tasks,
  isSelected,
  onCellMouseDown,
  onCellEnter,
  onDropTask,
}: Props) {
  return (
    <div
      className={`border h-28 p-1 relative bg-white ${
        isSelected ? "bg-blue-50" : ""
      }`}
      onMouseDown={(e) => onCellMouseDown(e, idx)}
      onMouseEnter={() => onCellEnter(idx)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const id = e.dataTransfer.getData("text/task-id");
        if (id) onDropTask(id, idx);
      }}
    >
      <div className="text-xs text-gray-500">{dayNumber}</div>
      <div className="absolute left-0 right-0 top-5 space-y-1">
        {tasks.map((t) => (
          <div
            key={t.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/task-id", t.id)}
            className="text-xs rounded px-1 py-0.5 truncate"
            style={{ background: "#EEF2FF" }}
          >
            {t.name}
          </div>
        ))}
      </div>
    </div>
  );
}

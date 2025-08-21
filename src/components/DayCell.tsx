import React, { useState } from "react";
import { Task } from "../context/TaskContext";
import TaskBar from "./Taskbar";

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
  const isToday =
    new Date(dateIso).toDateString() === new Date().toDateString();

  const [showAll, setShowAll] = useState(false);

  // limit tasks shown in cell
  const visibleTasks = showAll ? tasks : tasks.slice(0, 3);
  const extraCount = tasks.length - visibleTasks.length;

  return (
    <div
      className={`border relative bg-white transition-colors 
        ${isSelected ? "bg-blue-50" : ""} 
        ${isToday ? "border-2 border-blue-500" : "border-gray-200"}
        min-h-[5rem] sm:min-h-[6rem] md:min-h-[7rem] lg:min-h-[8rem] 
        p-1 sm:p-2
      `}
      onMouseDown={(e) => onCellMouseDown(e, idx)}
      onMouseEnter={() => onCellEnter(idx)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const id = e.dataTransfer.getData("text/task-id");
        if (id) onDropTask(id, idx);
      }}
    >
      {/* Date at top */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs sm:text-sm md:text-base font-medium 
            ${
              isToday
                ? "bg-blue-500 text-white w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full"
                : "text-gray-600"
            }
          `}
        >
          {dayNumber}
        </span>
      </div>

      {/* Tasks list */}
      <div className="absolute left-0 right-0 top-6 sm:top-7 space-y-1 px-1 overflow-hidden">
        {visibleTasks.map((task) => (
          <TaskBar
            key={task.id}
            task={task}
            onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}
            onClick={() =>
              alert(
                `Task: ${task.name}\nCategory: ${task.category}\nDate: ${dateIso}`
              )
            } // later: open modal
          />
        ))}

        {/* Show "+X more" if tasks are hidden */}
        {extraCount > 0 && !showAll && (
          <button
            className="text-xs sm:text-sm text-blue-600 underline"
            onClick={() => setShowAll(true)}
          >
            +{extraCount} more
          </button>
        )}
      </div>
    </div>
  );
}

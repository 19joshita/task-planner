import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface Props {
  dateISO: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  onMouseDown: (iso: string) => void;
  onMouseEnter: (iso: string) => void;
  children?: React.ReactNode;
}

export const DayCell: React.FC<Props> = ({
  dateISO,
  isCurrentMonth,
  isToday,
  onMouseDown,
  onMouseEnter,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateISO}`,
    data: { dateISO },
  });

  return (
    <div
      ref={setNodeRef}
      onMouseDown={() => onMouseDown(dateISO)}
      onMouseEnter={(e) => {
        if (e.buttons === 1) onMouseEnter(dateISO);
      }}
      className={`min-h-[100px] border p-1 relative transition-colors ${
        isCurrentMonth ? "bg-white" : "bg-gray-50"
      } ${isOver ? "ring-2 ring-blue-400" : ""}`}
    >
      <div
        className={`text-xs mb-1 ${
          isToday ? "font-bold text-blue-600" : "text-gray-500"
        }`}
      >
        {new Date(dateISO).getDate()}
      </div>
      {children}
    </div>
  );
};

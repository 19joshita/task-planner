import React, { useMemo, useRef, useState } from "react";
import { TaskItem } from "../types";
import { spanDays } from "../utils/date";
import classNames from "classnames";

interface Props {
  task: TaskItem;
  dayIndex: number; // index within the grid row where this segment starts
  span: number; // how many days visible in current row
  onResize: (id: string, side: "left" | "right", deltaDays: number) => void;
}

export const TaskBar: React.FC<Props> = ({
  task,
  dayIndex,
  span,
  onResize,
}) => {
  const [dragging, setDragging] = useState<null | {
    side: "left" | "right";
    startX: number;
  }>(null);

  const ref = useRef<HTMLDivElement | null>(null);

  const color = useMemo(
    () =>
      ({
        "To Do": "bg-yellow-200",
        "In Progress": "bg-blue-200",
        Review: "bg-purple-200",
        Completed: "bg-green-200",
      }[task.category]),
    [task.category]
  );

  const onPointerDown = (e: React.PointerEvent, side: "left" | "right") => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging({ side, startX: e.clientX });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !ref.current) return;
    const cellWidth = (ref.current.parentElement?.clientWidth || 0) / 7;
    const deltaPx = e.clientX - dragging.startX;
    const deltaDays = Math.trunc(deltaPx / cellWidth);

    if (deltaDays !== 0) {
      onResize(task.id, dragging.side, deltaDays);
      setDragging({ ...dragging, startX: e.clientX });
    }
  };

  const onPointerUp = () => {
    setDragging(null);
  };

  return (
    <div
      ref={ref}
      className={classNames(
        "relative flex items-center rounded-md px-2 py-1 text-xs shadow-sm border cursor-pointer",
        color,
        dragging && "ring-2 ring-blue-400"
      )}
      style={{ gridColumnStart: dayIndex + 1, gridColumnEnd: `span ${span}` }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Resize handles */}
      <div
        className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"
        onPointerDown={(e) => onPointerDown(e, "left")}
      />
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
        onPointerDown={(e) => onPointerDown(e, "right")}
      />

      {/* Task content */}
      <div className="truncate pr-2 font-medium">{task.name}</div>
      <span className="ml-auto text-[10px] opacity-70">
        {spanDays(task.start, task.end)}d
      </span>
    </div>
  );
};

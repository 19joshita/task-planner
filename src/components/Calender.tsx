// src/components/Calendar.tsx
import React, { useMemo, useState } from "react";
import { DndContext, DragEndEvent, useDraggable } from "@dnd-kit/core";
import {
  addDays,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import { useTasks } from "../context/TaskContext";
import { TaskItem } from "../types";
import { daysInMonthGrid, fmt, fromISO, spanDays } from "../utils/date";
import { DayCell } from "./DayCell";
import { TaskBar } from "./Taskbar";
import { Modal, CategorySelect } from "./Modal";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Small wrapper to make children draggable using dnd-kit */
function DraggableWrapper({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`transition-transform ${
        isDragging ? "opacity-60 scale-[1.02]" : ""
      }`}
    >
      {children}
    </div>
  );
}

export const Calendar: React.FC = () => {
  const [anchor, setAnchor] = useState(new Date());
  const grid = useMemo(() => daysInMonthGrid(anchor), [anchor]);
  const { tasks, addTask, updateTask, moveTaskByDays, filters } = useTasks();

  // Drag-to-select (for creating tasks)
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftCat, setDraftCat] = useState<
    "To Do" | "In Progress" | "Review" | "Completed"
  >("To Do");

  const startISO =
    dragStart && dragEnd
      ? isAfter(parseISO(dragStart), parseISO(dragEnd))
        ? dragEnd
        : dragStart
      : null;
  const endISO =
    dragStart && dragEnd
      ? isAfter(parseISO(dragStart), parseISO(dragEnd))
        ? dragStart
        : dragEnd
      : null;

  const commitCreate = () => {
    if (!startISO || !endISO || !draftName.trim()) return;
    addTask({
      name: draftName.trim(),
      category: draftCat,
      start: startISO,
      end: endISO,
    });
    setDraftName("");
    setDragStart(null);
    setDragEnd(null);
    setOpenCreate(false);
  };

  // Handle dropping tasks
  const onDragEnd = (ev: DragEndEvent) => {
    const id = ev.active.id.toString();
    const over = ev.over?.id?.toString();
    if (!over || !over.startsWith("day-")) return;
    const dayISO = over.replace("day-", "");

    const t = tasks.find((x) => x.id === id);
    if (!t) return;

    const oldStart = parseISO(t.start);
    const newStart = parseISO(dayISO);

    const deltaDays = Math.round(
      (newStart.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (deltaDays === 0) return;
    moveTaskByDays(id, deltaDays);
  };

  // Filter tasks
  const filtered = useMemo(() => {
    const today = new Date();
    return tasks.filter((t) => {
      if (
        filters.search &&
        !t.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.categories.length && !filters.categories.includes(t.category))
        return false;
      if (filters.weeks > 0) {
        const limit = addDays(today, filters.weeks * 7);
        if (isAfter(parseISO(t.start), limit)) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  // Build layout segments
  const segments = useMemo(() => {
    const first = grid[0];
    const last = grid[grid.length - 1];
    const rows: Record<
      string,
      { task: TaskItem; startIndex: number; span: number }[]
    > = {};

    filtered.forEach((task) => {
      const s = fromISO(task.start);
      const e = fromISO(task.end);
      const start = isBefore(s, first) ? first : s;
      const end = isAfter(e, last) ? last : e;

      for (let i = 0; i < grid.length; i += 7) {
        const rowStart = grid[i];
        const rowEnd = grid[i + 6];
        const segStart = isBefore(start, rowStart) ? rowStart : start;
        const segEnd = isAfter(end, rowEnd) ? rowEnd : end;

        if (isAfter(segStart, rowEnd) || isBefore(segEnd, rowStart)) continue;

        const startIndex = segStart.getDay(); // 0–6 (Sun–Sat)
        const visibleSpan = Math.max(
          1,
          Math.min(7 - startIndex, spanDays(fmt(segStart), fmt(segEnd)))
        );

        const rowKey = fmt(rowStart);
        (rows[rowKey] ||= []).push({ task, startIndex, span: visibleSpan });
      }
    });

    return rows;
  }, [filtered, grid]);

  // Resize
  const resizeTask = (
    id: string,
    side: "left" | "right",
    deltaDays: number
  ) => {
    const t = tasks.find((x) => x.id === id);
    if (!t || deltaDays === 0) return;
    const start = parseISO(t.start);
    const end = parseISO(t.end);
    if (side === "left") {
      const newStart = addDays(start, deltaDays);
      if (isAfter(newStart, end)) return;
      updateTask(id, { start: format(newStart, "yyyy-MM-dd") });
    } else {
      const newEnd = addDays(end, deltaDays);
      if (isBefore(newEnd, start)) return;
      updateTask(id, { end: format(newEnd, "yyyy-MM-dd") });
    }
  };

  // drag-select
  const handleMouseDown = (iso: string) => {
    setDragStart(iso);
    setDragEnd(iso);
  };
  const handleMouseEnter = (iso: string) => {
    if (dragStart) setDragEnd(iso);
  };
  const finishDragSelect = () => {
    if (dragStart && dragEnd) setOpenCreate(true);
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border px-3 py-1 hover:bg-gray-100"
            onClick={() => setAnchor(addDays(startOfMonth(anchor), -1))}
          >
            {"<"}
          </button>
          <div className="text-lg font-bold">{format(anchor, "MMMM yyyy")}</div>
          <button
            className="rounded-xl border px-3 py-1 hover:bg-gray-100"
            onClick={() => setAnchor(addDays(endOfMonth(anchor), 1))}
          >
            {">"}
          </button>
        </div>
        <button
          className="rounded-xl border px-4 py-1 hover:bg-gray-100"
          onClick={() => setAnchor(new Date())}
        >
          Today
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600">
        {dayNames.map((d) => (
          <div key={d} className="py-2 border-b">
            {d}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <DndContext onDragEnd={onDragEnd}>
        <div
          className="grid select-none"
          style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
          onMouseUp={finishDragSelect}
        >
          {grid.map((d, i) => {
            const rowStart = i % 7 === 0 ? fmt(d) : null;
            return (
              <DayCell
                key={i}
                dateISO={fmt(d)}
                isCurrentMonth={isSameMonth(d, anchor)}
                isToday={isSameDay(d, new Date())}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
              >
                {/* Render tasks at start of week row */}
                {rowStart && (
                  <div className="absolute left-0 top-8 right-0 px-1 space-y-1">
                    {(segments[rowStart] || []).map((seg) => (
                      <div key={seg.task.id} className="grid grid-cols-7 gap-1">
                        <div
                          className="col-span-7 contents"
                          style={{
                            gridColumnStart: seg.startIndex + 1,
                            gridColumnEnd: `span ${seg.span}`,
                          }}
                        >
                          <DraggableWrapper id={seg.task.id}>
                            <TaskBar
                              task={seg.task}
                              dayIndex={seg.startIndex}
                              span={seg.span}
                              onResize={resizeTask}
                            />
                          </DraggableWrapper>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DayCell>
            );
          })}
        </div>
      </DndContext>

      {/* Selection info */}
      {startISO && endISO && (
        <div className="mt-3 text-sm text-gray-600">
          Creating task from{" "}
          <span className="font-medium">
            {format(parseISO(startISO), "dd MMM")}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {format(parseISO(endISO), "dd MMM")}
          </span>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={commitCreate}
        title="New Task"
        submitText="Create"
      >
        <label className="block">
          <span className="mb-1 block text-sm text-gray-600">Task name</span>
          <input
            className="w-full rounded-xl border px-3 py-2"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="e.g., Write docs"
          />
        </label>
        <CategorySelect value={draftCat} onChange={setDraftCat} />
        {startISO && endISO && (
          <p className="text-sm text-gray-500">
            Duration: {spanDays(startISO, endISO)} days
          </p>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;

import React from "react";
import {
  addDays,
  addMonths,
  subMonths,
  differenceInCalendarDays,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { getMonthDays, isoDay, clamp, addDaysSafe } from "../utils/dateUtils";
import DayCell from "./DayCell";
import TaskBar from "./Taskbar"; // TaskBar's role: render a single multi-day visual bar (draggable/resizable) — see note below
import TaskModal from "./TaskModal";
import { useTasks } from "../context/TaskContext";

export default function Calendar() {
  // current month state (so we can navigate months)
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    () => new Date()
  );
  const days = getMonthDays(currentMonth); // days for the active month view
  const monthStart = new Date(days[0]);

  const { filteredTasks, tasks, updateTask } = useTasks();

  // Drag-select create
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [selStart, setSelStart] = React.useState<number | null>(null);
  const [selEnd, setSelEnd] = React.useState<number | null>(null);

  // Modal (create/edit)
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalRange, setModalRange] = React.useState<{
    startIso: string;
    endIso: string;
  } | null>(null);
  const [editingTask, setEditingTask] = React.useState<any | null>(null);

  // Resizing state
  const pointerRef = React.useRef<any>(null);
  const [resizing, setResizing] = React.useState<null | {
    id: string;
    side: "left" | "right";
  }>(null);
  /* ------------------ Selection lifecycle ------------------ */
  // onUp captures mouse up for selection and opens modal
  React.useEffect(() => {
    function onUp() {
      if (isSelecting) {
        setIsSelecting(false);
        if (selStart !== null && selEnd !== null) {
          const s = Math.min(selStart, selEnd);
          const e = Math.max(selStart, selEnd);
          setModalRange({
            startIso: isoDay(addDaysSafe(monthStart, s)),
            endIso: isoDay(addDaysSafe(monthStart, e)),
          });
          setModalOpen(true);
        }
        setSelStart(null);
        setSelEnd(null);
      }
    }
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [isSelecting, selStart, selEnd, monthStart]);

  const onCellMouseDown = (e: React.MouseEvent, idx: number) => {
    // only left button
    if (e.button !== 0) return;
    setIsSelecting(true);
    setSelStart(idx);
    setSelEnd(idx);
  };
  const onCellEnter = (idx: number) => {
    if (!isSelecting) return;
    setSelEnd(idx);
  };
  const tasksForDay = React.useCallback(
    (idx: number) => {
      const day = addDaysSafe(monthStart, idx);
      return filteredTasks.filter((t) => {
        const a = new Date(t.start);
        a.setHours(0, 0, 0, 0);
        const b = new Date(t.end);
        b.setHours(0, 0, 0, 0);
        return day >= a && day <= b;
      });
    },
    [filteredTasks, monthStart]
  );

  /* ------------------ Move task by drop ------------------ */
  const onDropTask = (taskId: string, targetIdx: number) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    const origStart = new Date(t.start);
    const origEnd = new Date(t.end);
    const dur = differenceInCalendarDays(origEnd, origStart);
    const newStart = addDaysSafe(monthStart, targetIdx);
    const newEnd = addDaysSafe(newStart, dur);
    updateTask(taskId, { start: isoDay(newStart), end: isoDay(newEnd) });
  };

  /* ------------------ Click-to-edit ------------------ */
  const openEdit = (taskId: string) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setEditingTask(t);
    setModalRange({ startIso: t.start, endIso: t.end });
    setModalOpen(true);
  };

  /* ------------------ Multi-day bar layout & stacking ------------------ */
  const positioned = React.useMemo(() => {
    return filteredTasks.map((t) => {
      const sIdx = clamp(
        differenceInCalendarDays(new Date(t.start), monthStart),
        0,
        days.length - 1
      );
      const eIdx = clamp(
        differenceInCalendarDays(new Date(t.end), monthStart),
        0,
        days.length - 1
      );
      return { ...t, sIdx, eIdx } as any;
    });
  }, [filteredTasks, days.length, monthStart]);
  // greedy stacking to avoid overlapping bars vertically
  const rows = React.useMemo(() => {
    const r: any[][] = [];
    const items = positioned.slice().sort((a: any, b: any) => a.sIdx - b.sIdx);
    items.forEach((it) => {
      let placed = false;
      for (let i = 0; i < r.length; i++) {
        const conflict = r[i].some(
          (ex: any) => !(it.eIdx < ex.sIdx || it.sIdx > ex.eIdx)
        );
        if (!conflict) {
          r[i].push(it);
          placed = true;
          break;
        }
      }
      if (!placed) r.push([it]);
    });
    return r;
  }, [positioned]);

  /* ------------------ Resizing handlers (pointer events) ------------------ */
  React.useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!resizing || !pointerRef.current) return;
      const { startX, origS, origE, cellW } = pointerRef.current;
      const delta = Math.round((e.clientX - startX) / cellW);
      if (resizing.side === "left") {
        const newS = clamp(origS + delta, 0, origE);
        updateTask(resizing.id, {
          start: isoDay(addDaysSafe(monthStart, newS)),
        });
      } else {
        const newE = clamp(origE + delta, origS, days.length - 1);
        updateTask(resizing.id, {
          end: isoDay(addDaysSafe(monthStart, newE)),
        });
      }
    }
    function onUp() {
      setResizing(null);
      pointerRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    if (resizing) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizing, monthStart, days.length, updateTask]);
  const beginResize = (
    id: string,
    side: "left" | "right",
    clientX: number,
    origS: number,
    origE: number
  ) => {
    const grid = document.getElementById("calendar-grid");
    const cellW = grid ? grid.clientWidth / days.length : 40;
    pointerRef.current = { startX: clientX, origS, origE, cellW };
    setResizing({ id, side });
  };

  /* ------------------ Month navigation helpers ------------------ */
  const gotoPrevMonth = () => setCurrentMonth((p) => subMonths(p, 1));
  const gotoNextMonth = () => setCurrentMonth((p) => addMonths(p, 1));
  const gotoToday = () => setCurrentMonth(new Date());

  /* ------------------ Render helpers ------------------ */
  const today = new Date();

  function weekdayHeader() {
    const start = addDays(monthStart, -((monthStart.getDay() + 7) % 7)); // start of week containing monthStart
    const labels = Array.from({ length: 7 }).map((_, i) =>
      format(addDays(start, i), "EEE")
    );
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {labels.map((l) => (
          <div
            key={l}
            className="text-center text-xs font-medium text-gray-600"
          >
            {l}
          </div>
        ))}
      </div>
    );
  }
  /* ------------------ Render ------------------ */
  return (
    <div>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={gotoPrevMonth}
            className="px-3 py-1 rounded-md bg-white border hover:shadow-sm"
            aria-label="Previous month"
          >
            ◀
          </button>
          <button
            onClick={gotoToday}
            className="px-3 py-1 rounded-md bg-white border hover:shadow-sm"
            aria-label="Today"
          >
            Today
          </button>
          <button
            onClick={gotoNextMonth}
            className="px-3 py-1 rounded-md bg-white border hover:shadow-sm"
            aria-label="Next month"
          >
            ▶
          </button>
        </div>

        <div className="text-lg font-semibold w-fit">
          {format(currentMonth, "MMMM yyyy")}
        </div>

        <div className="text-sm text-gray-500">
          <span className="hidden sm:inline">Month view • </span>
          {filteredTasks.length} visible task
          {filteredTasks.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Multi-day task bars stacked above the grid */}
      <div className="relative bg-white rounded-lg p-3 shadow-sm overflow-visible">
        {/* stacked rows container (absolute-positioned bars) */}
        <div style={{ minHeight: rows.length * 44 }} className="relative">
          {rows.map((row, ridx) =>
            row.map((t: any) => {
              const leftPct = (t.sIdx / days.length) * 100;
              const widthPct = ((t.eIdx - t.sIdx + 1) / days.length) * 100;
              const style: React.CSSProperties = {
                position: "absolute",
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                top: `${ridx * 44}px`,
                height: "36px",
              };
              return (
                <div
                  key={t.id}
                  style={style}
                  className="flex items-center gap-2 px-3 rounded-md cursor-grab select-none"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/task-id", t.id);
                  }}
                >
                  {/* Use TaskBar component for visuals and click handling */}
                  {/* <div>
                    <TaskBar
                      task={t}
                      style={{ width: "100%" }}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/task-id", t.id);
                      }}
                      onClick={() => openEdit(t.id)}
                    />
                  </div> */}
                  {/* Left/Right small visible handles (accessible) */}
                  <div
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginResize(t.id, "left", e.clientX, t.sIdx, t.eIdx);
                    }}
                    className="w-3 h-6 cursor-ew-resize"
                    title="Drag to change start date"
                  />
                  <div
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      beginResize(t.id, "right", e.clientX, t.sIdx, t.eIdx);
                    }}
                    className="w-3 h-6 cursor-ew-resize"
                    title="Drag to change end date"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Calendar grid (days) */}
        {weekdayHeader()}
        <div
          id="calendar-grid"
          className="grid grid-cols-3 sm:grid-cols-7 gap-1 mt-2"
        >
          {days.map((d, idx) => {
            const isSelected =
              selStart !== null &&
              selEnd !== null &&
              idx >= Math.min(selStart, selEnd) &&
              idx <= Math.max(selStart, selEnd);

            return (
              <DayCell
                key={d.toISOString()}
                idx={idx}
                dateIso={d.toISOString()}
                dayNumber={d.getDate()}
                tasks={tasksForDay(idx)}
                isSelected={isSelected}
                onCellMouseDown={onCellMouseDown}
                onCellEnter={onCellEnter}
                onDropTask={(taskId) => onDropTask(taskId, idx)}
              />
            );
          })}
        </div>
      </div>

      {/* Task modal for create / edit */}
      <TaskModal
        open={modalOpen}
        startIso={modalRange?.startIso ?? isoDay(addDaysSafe(monthStart, 0))}
        endIso={modalRange?.endIso ?? isoDay(addDaysSafe(monthStart, 0))}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
          setModalRange(null);
        }}
        editTask={editingTask}
      />
    </div>
  );
}

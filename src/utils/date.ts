import { addDays, eachDayOfInterval, endOfMonth, format, isAfter, isBefore, isEqual, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, endOfWeek, differenceInCalendarDays } from 'date-fns';
export const fmt = (d: Date) => format(d, 'yyyy-MM-dd');
export const toISO = (d: Date | string) => typeof d === 'string' ? d : fmt(d);
export const fromISO = (s: string) => parseISO(s);
export const daysInMonthGrid = (anchor: Date) => {
// 6 rows x 7 days month grid, starting Monday by default? We'll use locale-agnostic startOfWeek (Sunday) for simplicity
const start = startOfWeek(startOfMonth(anchor));
const end = endOfWeek(endOfMonth(anchor));
return eachDayOfInterval({ start, end });
};
export const isWithin = (d: Date, start: Date, end: Date) =>
(isEqual(d, start) || isAfter(d, start)) && (isEqual(d, end) || isBefore(d, end));
export const spanDays = (startISO: string, endISO: string) => Math.max(1, differenceInCalendarDays(parseISO(endISO), parseISO(startISO)) + 1);
export const clampToMonth = (dateISO: string, month: Date) => {
const d = fromISO(dateISO);
const s = startOfMonth(month);
const e = endOfMonth(month);
if (isBefore(d, s)) return fmt(s);
if (isAfter(d, e)) return fmt(e);
return dateISO;
};
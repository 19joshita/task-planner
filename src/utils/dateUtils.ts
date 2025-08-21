import { startOfMonth, endOfMonth, eachDayOfInterval, addDays } from 'date-fns';


export function getMonthDays(base = new Date()) {
const start = startOfMonth(base);
const end = endOfMonth(base);
return eachDayOfInterval({ start, end });
}


export const isoDay = (d: Date) => {
const n = new Date(d);
n.setHours(0,0,0,0);
return n.toISOString();
};


export const clamp = (v:number, a:number, b:number) => Math.max(a, Math.min(b, v));


export const addDaysSafe = (d: Date, n: number) => addDays(d, n);
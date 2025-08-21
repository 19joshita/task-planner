import { useEffect, useRef, useState } from 'react';


export function useLocalStorage<T>(key: string, initial: T) {
const [value, setValue] = useState<T>(() => {
const raw = localStorage.getItem(key);
return raw ? (JSON.parse(raw) as T) : initial;
});
const first = useRef(true);
useEffect(() => {
if (first.current) { first.current = false; return; }
localStorage.setItem(key, JSON.stringify(value));
}, [key, value]);
return [value, setValue] as const;
}
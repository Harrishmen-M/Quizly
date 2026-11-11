"use client";
import { useEffect, useRef, useState } from "react";

export default function Countdown({ seconds, receivedAt, total, onDone }: { seconds: number; receivedAt: number; total: number; onDone?: () => void }) {
  const [left, setLeft] = useState(seconds);
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });

  useEffect(() => {
    let fired = false;
    const tick = () => {
      const l = Math.max(0, seconds - (performance.now() - receivedAt) / 1000);
      setLeft(l);
      if (l <= 0 && !fired) { fired = true; done.current?.(); }
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [seconds, receivedAt]);

  return (
    <div>
      <p className="font-serif text-5xl tabular-nums">{Math.ceil(left)}</p>
      <div className="mt-2 h-1 w-full bg-line">
        <div className="h-1 bg-ink transition-[width] duration-200 ease-linear" style={{ width: `${(left / total) * 100}%` }} />
      </div>
    </div>
  );
}
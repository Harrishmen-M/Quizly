"use client";
import { useState } from "react";
import { Check, X } from "lucide-react";

const options = ["200 OK", "201 Created", "204 No Content", "301 Moved"];
const correct = 1;

export default function DemoQuestion() {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="rounded-xl border border-line bg-white p-6">
      <p className="text-sm text-muted">Question 3 of 12</p>
      <p className="mt-2 font-serif text-2xl leading-snug">Which status code tells the client a new resource was created?</p>
      <ul className="mt-6 space-y-2">
        {options.map((o, i) => {
          const done = picked !== null;
          const isRight = done && i === correct;
          const isWrong = done && i === picked && i !== correct;
          return (
            <li key={o}>
              <button disabled={done} onClick={() => setPicked(i)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${isRight ? "border-ink bg-ink text-paper" : isWrong ? "border-line text-muted line-through" : "border-line hover:border-ink"} ${done && !isRight && !isWrong ? "opacity-50" : ""}`}>
                {o}{isRight && <Check size={16} />}{isWrong && <X size={16} />}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 h-5 text-sm text-muted" aria-live="polite">
        {picked === null ? "Tap an answer to try it." : picked === correct ? "Correct. 201 is the one for creation." : "Not quite. It was 201 Created."}
      </p>
    </div>
  );
}

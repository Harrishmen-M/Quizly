"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toggleStar } from "@/app/actions";

export default function StarButton({
  quizId,
  count,
  starred,
  signedIn,
}: {
  quizId: string;
  count: number;
  starred: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(starred);
  const [n, setN] = useState(count);
  const [, start] = useTransition();
  const [err, setErr] = useState("");

  function click() {
    if (!signedIn) return router.push("/login");
    const next = !on;
    setOn(next);
    setN(n + (next ? 1 : -1));
    setErr("");
    start(async () => {
      const res = await toggleStar(quizId);
      if ("error" in res) {
        setOn(!next);
        setN(n);
        setErr(res.error);
      }
    });
  }

  return (
    <div>
      <button onClick={click} aria-pressed={on} className="btn-ghost">
        <Star size={16} className={on ? "fill-ink" : ""} />{" "}
        {on ? "Starred" : "Star"} <span className="text-muted">{n}</span>
      </button>
      {err && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {err}
        </p>
      )}
    </div>
  );
}

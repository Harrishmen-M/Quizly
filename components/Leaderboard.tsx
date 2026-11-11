"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Row = { id: string; nickname: string; score: number; correct: number; answered: number };

export default function Leaderboard({ sessionId, refreshKey, meId, limit }: { sessionId: string; refreshKey: string; meId?: string; limit?: number }) {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    createClient().rpc("leaderboard", { p_session: sessionId }).then(({ data }) => setRows((data as Row[]) ?? []));
  }, [sessionId, refreshKey]);

  if (!rows.length) return <p className="border-t border-line py-6 text-muted">No scores yet.</p>;
  return (
    <ol className="border-t border-line">
      {rows.slice(0, limit ?? rows.length).map((r, i) => (
        <li key={r.id} className={`grid grid-cols-[2rem_1fr_auto] items-baseline gap-3 border-b border-line py-3 ${r.id === meId ? "font-medium" : ""}`}>
          <span className="font-serif text-muted">{i + 1}</span>
          <span>
            {r.nickname}{r.id === meId && <span className="text-muted"> (you)</span>}
            <span className="ml-3 text-sm font-normal text-muted">{r.correct} correct</span>
          </span>
          <span className="tabular-nums">{r.score}</span>
        </li>
      ))}
    </ol>
  );
}
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { advanceGame } from "@/app/actions";
import { useSessionState } from "@/lib/useSessionState";
import Countdown from "@/components/Countdown";
import Leaderboard from "@/components/Leaderboard";

type Player = { id: string; nickname: string };

export default function HostRoom({ sessionId, code, title, initialPlayers }: { sessionId: string; code: string; title: string; initialPlayers: Player[] }) {
  const { state, receivedAt, refresh } = useSessionState(sessionId);
  const [players, setPlayers] = useState(initialPlayers);
  const [site, setSite] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setSite(window.location.host);
    const supabase = createClient();
    const channel = supabase
      .channel(`host-${sessionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "session_players", filter: `session_id=eq.${sessionId}` }, (payload) => {
        const p = payload.new as Player;
        setPlayers((cur) => (cur.some((x) => x.id === p.id) ? cur : [...cur, { id: p.id, nickname: p.nickname }]));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  async function go(phase: string, index: number) {
    setErr("");
    const res = await advanceGame(sessionId, phase, index);
    if ("error" in res) setErr(res.error);
    else refresh();
  }

  if (!state) return <p className="text-muted">Opening room...</p>;
  const key = `${state.status}-${state.index}-${state.phase}`;

  if (state.status === "finished") {
    return (
      <div className="max-w-2xl">
        <p className="text-muted">{title}</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Final results</h1>
        <div className="mt-8"><Leaderboard sessionId={sessionId} refreshKey={key} /></div>
      </div>
    );
  }

  if (state.status === "active" && state.question) {
    const q = state.question;
    const reveal = state.phase === "reveal";
    const last = state.index + 1 >= state.total;
    return (
      <div className="max-w-2xl">
        <p className="text-muted">{title}, question {state.index + 1} of {state.total}</p>
        <h1 className="mt-3 text-3xl leading-snug sm:text-4xl">{q.text}</h1>
        {!reveal && (
          <div className="mt-6">
            <Countdown key={state.index} seconds={q.remaining} receivedAt={receivedAt} total={q.time_limit}
              onDone={() => setTimeout(() => go("question", state.index), 1000)} />
          </div>
        )}
        <ul className="mt-6 space-y-2">
          {q.options.map((o) => {
            const right = reveal && o.id === state.correct_option_id;
            return (
              <li key={o.id} className={`rounded-lg border px-4 py-3 text-sm ${right ? "border-ink bg-ink text-paper" : reveal ? "border-line text-muted" : "border-line"}`}>{o.text}</li>
            );
          })}
        </ul>
        <div className="mt-8 flex items-center gap-4">
          {reveal
            ? <button onClick={() => go("reveal", state.index)} className="btn-primary h-12 px-6 text-base">{last ? "See final results" : "Next question"}</button>
            : <button onClick={() => go("question", state.index)} className="btn-ghost h-12 px-6 text-base">Show answer</button>}
          {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        </div>
        {reveal && <div className="mt-10"><h2 className="mb-3 text-2xl">Leaderboard</h2><Leaderboard sessionId={sessionId} refreshKey={key} limit={5} /></div>}
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <p className="text-muted">{title}</p>
        <p className="mt-6 text-sm text-muted">Go to {site}/join and enter</p>
        <p className="mt-1 font-serif text-7xl tracking-[0.12em] sm:text-8xl">{code}</p>
        <div className="mt-8">
          <button onClick={() => go("waiting", -1)} disabled={players.length === 0} className="btn-primary h-12 px-6 text-base disabled:cursor-not-allowed disabled:opacity-50">Start quiz</button>
          {players.length === 0 && <p className="mt-2 text-sm text-muted">Waiting for at least one player.</p>}
          {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
        </div>
      </div>
      <div>
        <h2 className="text-2xl">Players <span className="text-muted">{players.length}</span></h2>
        {players.length ? (
          <ul className="mt-3 border-t border-line">{players.map((p) => <li key={p.id} className="border-b border-line py-3">{p.nickname}</li>)}</ul>
        ) : (
          <p className="mt-3 border-t border-line py-10 text-muted">Nobody has joined yet.</p>
        )}
      </div>
    </div>
  );
}
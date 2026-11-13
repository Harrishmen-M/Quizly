"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { advanceGame } from "@/app/actions";
import { useSessionState } from "@/lib/useSessionState";
import Countdown from "@/components/Countdown";
import Leaderboard from "@/components/Leaderboard";

type Player = { id: string; nickname: string };

function Progress({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= index ? "bg-ink" : "bg-line"}`} />
      ))}
    </div>
  );
}

function CopyLink({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`Join at ${window.location.origin}/join with code ${code}`);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {}
  }
  return (
    <button onClick={copy} className="btn-ghost h-12 px-5 text-base">
      {done ? <Check size={16} /> : <Copy size={16} />} {done ? "Copied" : "Copy join link"}
    </button>
  );
}

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

  if (!state) {
    return (
      <div aria-hidden className="grid animate-pulse gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-96 rounded-2xl bg-ink/5" />
        <div className="h-96 rounded-2xl bg-ink/5" />
      </div>
    );
  }
  const key = `${state.status}-${state.index}-${state.phase}`;

  /* Final results */
  if (state.status === "finished") {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted">{title}</p>
        <h1 className="mt-2 text-5xl tracking-[-0.03em] sm:text-6xl">Final results</h1>
        <div className="mt-10 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <Leaderboard sessionId={sessionId} refreshKey={key} />
        </div>
        <div className="mt-8 flex gap-3">
          <Link href="/profile" prefetch={false} className="btn-primary h-12 px-6 text-base">Back to profile</Link>
          <Link href="/explore" className="btn-ghost h-12 px-6 text-base">Explore quizzes</Link>
        </div>
      </div>
    );
  }

  /* Question and reveal */
  if (state.status === "active" && state.question) {
    const q = state.question;
    const reveal = state.phase === "reveal";
    const last = state.index + 1 >= state.total;
    return (
      <div>
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted">{title}</p>
            <p className="mt-1 font-serif text-xl">Question {state.index + 1} <span className="text-muted">of {state.total}</span></p>
          </div>
          {!reveal && (
            <div className="w-36">
              <Countdown key={state.index} seconds={q.remaining} receivedAt={receivedAt} total={q.time_limit}
                onDone={() => setTimeout(() => go("question", state.index), 1000)} />
            </div>
          )}
        </div>
        <div className="mt-4"><Progress index={state.index} total={state.total} /></div>

        <h1 className="mt-10 max-w-4xl text-3xl leading-tight tracking-[-0.02em] sm:text-5xl">{q.text}</h1>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {q.options.map((o, i) => {
            const right = reveal && o.id === state.correct_option_id;
            return (
              <li key={o.id} className={`flex items-center gap-4 rounded-2xl border px-5 py-5 text-lg transition sm:text-xl ${
                right ? "border-ink bg-ink text-paper" : reveal ? "border-line bg-white/40 text-muted" : "border-line bg-white"
              }`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif ${right ? "bg-paper text-ink" : "bg-paper text-muted"}`}>
                  {"ABCD"[i]}
                </span>
                <span className="flex-1">{o.text}</span>
                {right && <Check size={22} />}
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {reveal ? (
            <button onClick={() => go("reveal", state.index)} className="btn-primary h-12 px-6 text-base">
              {last ? "See final results" : "Next question"}
            </button>
          ) : (
            <button onClick={() => go("question", state.index)} className="btn-ghost h-12 px-6 text-base">Show answer now</button>
          )}
          {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        </div>

        {reveal && (
          <div className="mt-14 max-w-2xl">
            <h2 className="mb-3 text-2xl">Leaderboard</h2>
            <Leaderboard sessionId={sessionId} refreshKey={key} limit={5} />
          </div>
        )}
      </div>
    );
  }

  /* Waiting room */
  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-line bg-white p-8 sm:p-12">
        <p className="text-muted">{title}</p>
        <p className="mt-10 text-lg">
          Go to <span className="font-medium">{site}/join</span> and enter
        </p>
        <p className="mt-3 whitespace-nowrap font-serif text-6xl tabular-nums tracking-[0.06em] sm:text-8xl lg:text-9xl">
          {code.slice(0, 3)} {code.slice(3)}
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <button
            onClick={() => go("waiting", -1)}
            disabled={players.length === 0}
            className="btn-primary h-12 px-7 text-base disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start quiz
          </button>
          <CopyLink code={code} />
        </div>
        <p className="mt-4 text-sm text-muted">
          {players.length === 0 ? "Waiting for the first player to join." : `${players.length} ${players.length === 1 ? "player is" : "players are"} ready.`}
        </p>
        {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
      </div>

      <div>
        <h2 className="text-2xl tracking-[-0.02em]">Players <span className="font-sans text-base text-muted">{players.length}</span></h2>
        {players.length ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {players.map((p) => (
              <li key={p.id} className="animate-[rise_0.3s_ease-out] rounded-full border border-line bg-white px-4 py-2">
                {p.nickname}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
            <p className="font-serif text-2xl">Nobody yet.</p>
            <p className="mx-auto mt-2 max-w-[14rem] text-sm text-muted">Players appear here the moment they join.</p>
          </div>
        )}
      </div>
    </div>
  );
}
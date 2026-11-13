"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSessionState } from "@/lib/useSessionState";
import Countdown from "@/components/Countdown";
import Leaderboard from "@/components/Leaderboard";

type Player = { id: string; nickname: string };
type Me = { playerId: string; sessionId: string; nickname: string };

function Progress({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= index ? "bg-ink" : "bg-line"}`} />
      ))}
    </div>
  );
}

function Game({ me }: { me: Me }) {
  const { state, receivedAt } = useSessionState(me.sessionId, me.playerId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [pick, setPick] = useState<{ index: number; option: string } | null>(null);
  const [upFor, setUpFor] = useState(-1);
  const [err, setErr] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.from("session_players").select("id, nickname").eq("session_id", me.sessionId).order("nickname").then(({ data }) => setPlayers(data ?? []));
    const channel = supabase
      .channel(`players-${me.sessionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "session_players", filter: `session_id=eq.${me.sessionId}` }, (payload) => {
        const p = payload.new as Player;
        setPlayers((cur) => (cur.some((x) => x.id === p.id) ? cur : [...cur, { id: p.id, nickname: p.nickname }]));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [me.sessionId]);

  async function answer(option: string, index: number) {
    setErr("");
    setPick({ index, option });
    const { data } = await createClient().rpc("submit_answer", { p_player: me.playerId, p_option: option });
    if (data?.error) { setPick(null); setErr(data.error); }
  }

  if (!state) {
    return (
      <div aria-hidden className="animate-pulse">
        <div className="h-10 w-3/4 rounded bg-ink/10" />
        <div className="mt-4 h-5 w-1/2 rounded bg-ink/5" />
        <div className="mt-10 h-48 rounded-2xl bg-ink/5" />
      </div>
    );
  }
  const key = `${state.status}-${state.index}-${state.phase}`;

  /* Waiting room */
  if (state.status === "waiting") {
    return (
      <div>
        <p className="flex items-center gap-2.5 text-sm text-muted">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          Waiting for the host to start
        </p>
        <h1 className="mt-6 text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">
          You're in,
          <br />
          {me.nickname}.
        </h1>
        <p className="mt-4 text-muted">Keep this screen open. The first question appears here by itself.</p>

        <h2 className="mt-14 text-xl">In the room <span className="font-sans text-base text-muted">{players.length}</span></h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {players.map((p) => (
            <li key={p.id} className={`animate-[rise_0.3s_ease-out] rounded-full border px-4 py-2 text-sm ${p.id === me.playerId ? "border-ink bg-ink text-paper" : "border-line bg-white"}`}>
              {p.nickname}{p.id === me.playerId && " (you)"}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* Finished */
  if (state.status === "finished") {
    return (
      <div>
        <h1 className="text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">That's the game.</h1>
        <p className="mt-3 text-muted">Here's how everyone finished.</p>
        <div className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-7">
          <Leaderboard sessionId={me.sessionId} refreshKey={key} meId={me.playerId} />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/join" className="btn-primary h-12 px-6 text-base">Join another game</Link>
          <Link href="/explore" className="btn-ghost h-12 px-6 text-base">Explore quizzes</Link>
        </div>
      </div>
    );
  }

  /* Question and reveal */
  const q = state.question!;
  const reveal = state.phase === "reveal";
  const picked = pick && pick.index === state.index ? pick.option : null;
  const locked = !!picked || !!state.answered;
  const timeUp = upFor === state.index;
  const my = state.my;

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Question {state.index + 1} of {state.total}</span>
        {reveal && my && <span>Score {my.score}</span>}
      </div>
      <div className="mt-3"><Progress index={state.index} total={state.total} /></div>

      {!reveal ? (
        <div className="mt-6">
          <Countdown key={state.index} seconds={q.remaining} receivedAt={receivedAt} total={q.time_limit} onDone={() => setUpFor(state.index)} />
        </div>
      ) : (
        my && (
          <div className={`mt-6 rounded-2xl border p-5 ${my.correct ? "border-ink bg-ink text-paper" : "border-line bg-white"}`}>
            <p className="font-serif text-3xl tracking-[-0.02em]">
              {my.option_id === null ? "No answer in time." : my.correct ? "Correct." : "Not this time."}
            </p>
            <p className={`mt-1 text-sm ${my.correct ? "text-paper/70" : "text-muted"}`}>
              {my.correct ? `+${my.points} points` : "No points for this one."}
            </p>
          </div>
        )
      )}

      <h1 className="mt-8 text-2xl leading-snug tracking-[-0.01em] sm:text-3xl">{q.text}</h1>

      <ul className="mt-6 space-y-3">
        {q.options.map((o, i) => {
          const right = reveal && o.id === state.correct_option_id;
          const mineWrong = reveal && my?.option_id === o.id && !right;
          const mineLive = !reveal && picked === o.id;
          return (
            <li key={o.id}>
              <button
                onClick={() => answer(o.id, state.index)}
                disabled={reveal || locked || timeUp}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left text-lg transition active:scale-[0.99] disabled:cursor-default ${
                  right ? "border-ink bg-ink text-paper"
                  : mineWrong ? "border-ink/40 bg-white text-muted"
                  : mineLive ? "border-ink bg-white ring-4 ring-ink/10"
                  : reveal || locked || timeUp ? "border-line bg-white/50 text-muted"
                  : "border-line bg-white hover:border-ink"
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif ${right ? "bg-paper text-ink" : "bg-paper text-muted"}`}>
                  {"ABCD"[i]}
                </span>
                <span className={`flex-1 ${mineWrong ? "line-through decoration-1" : ""}`}>{o.text}</span>
                {right && <Check size={20} />}
                {mineWrong && <X size={20} />}
              </button>
            </li>
          );
        })}
      </ul>

      {!reveal && locked && <p className="mt-6 text-center text-muted" aria-live="polite">Answer locked in. Waiting for the others.</p>}
      {!reveal && !locked && timeUp && <p className="mt-6 text-center text-muted">Time's up.</p>}
      {err && <p role="alert" className="mt-6 text-center text-sm text-red-700">{err}</p>}

      {reveal && (
        <div className="mt-12">
          <h2 className="mb-3 text-2xl">Leaderboard</h2>
          <div className="rounded-2xl border border-line bg-white p-5">
            <Leaderboard sessionId={me.sessionId} refreshKey={key} meId={me.playerId} limit={5} />
          </div>
          <p className="mt-5 text-center text-sm text-muted">The next question starts when the host moves on.</p>
        </div>
      )}
    </div>
  );
}

export default function PlayRoom({ code }: { code: string }) {
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  useEffect(() => {
    let saved: Me | null = null;
    try {
      const s = JSON.parse(sessionStorage.getItem("quizly-player") ?? "null");
      if (s?.code === code) saved = s;
    } catch {}
    setMe(saved);
  }, [code]);

  if (me === undefined) return <p className="text-muted">Loading...</p>;
  if (me === null) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <h1 className="text-3xl">Join this room first</h1>
        <p className="mx-auto mt-2 max-w-xs text-muted">Enter the code and a nickname so the host can see you.</p>
        <Link href="/join" className="btn-primary mt-6 h-12 px-6 text-base">Enter a code</Link>
      </div>
    );
  }
  return <Game me={me} />;
}
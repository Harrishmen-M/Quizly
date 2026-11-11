"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSessionState } from "@/lib/useSessionState";
import Countdown from "@/components/Countdown";
import Leaderboard from "@/components/Leaderboard";

type Player = { id: string; nickname: string };
type Me = { playerId: string; sessionId: string; nickname: string };

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

  if (!state) return <p className="text-muted">Loading...</p>;
  const key = `${state.status}-${state.index}-${state.phase}`;

  if (state.status === "waiting") {
    return (
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl sm:text-5xl">You're in, {me.nickname}.</h1>
          <p className="mt-4 text-muted">Waiting for the host to start the game.</p>
        </div>
        <div>
          <h2 className="text-2xl">In the room <span className="text-muted">{players.length}</span></h2>
          <ul className="mt-3 border-t border-line">
            {players.map((p) => <li key={p.id} className="border-b border-line py-3">{p.nickname}{p.id === me.playerId && <span className="text-muted"> (you)</span>}</li>)}
          </ul>
        </div>
      </div>
    );
  }

  if (state.status === "finished") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">That's the game.</h1>
        <p className="mt-3 text-muted">Final standings</p>
        <div className="mt-6"><Leaderboard sessionId={me.sessionId} refreshKey={key} meId={me.playerId} /></div>
        <Link href="/join" className="btn-ghost mt-8">Join another game</Link>
      </div>
    );
  }

  const q = state.question!;
  const reveal = state.phase === "reveal";
  const picked = pick && pick.index === state.index ? pick.option : null;
  const locked = !!picked || !!state.answered;
  const timeUp = upFor === state.index;

  return (
    <div className="max-w-2xl">
      <p className="text-muted">Question {state.index + 1} of {state.total}</p>
      <h1 className="mt-3 text-3xl leading-snug sm:text-4xl">{q.text}</h1>

      {!reveal && (
        <div className="mt-6">
          <Countdown key={state.index} seconds={q.remaining} receivedAt={receivedAt} total={q.time_limit} onDone={() => setUpFor(state.index)} />
        </div>
      )}

      <ul className="mt-6 space-y-2">
        {q.options.map((o) => {
          const right = reveal && o.id === state.correct_option_id;
          const mine = reveal ? state.my?.option_id === o.id : picked === o.id;
          return (
            <li key={o.id}>
              <button
                onClick={() => answer(o.id, state.index)}
                disabled={reveal || locked || timeUp}
                className={`w-full rounded-lg border px-4 py-4 text-left transition-colors ${right ? "border-ink bg-ink text-paper" : mine ? "border-ink" : reveal ? "border-line text-muted" : "border-line hover:border-ink"} disabled:cursor-default`}
              >
                {o.text}
              </button>
            </li>
          );
        })}
      </ul>

      {!reveal && locked && <p className="mt-5 text-muted" aria-live="polite">Answer locked in. Waiting for the others.</p>}
      {!reveal && !locked && timeUp && <p className="mt-5 text-muted">Time's up.</p>}
      {err && <p role="alert" className="mt-5 text-sm text-red-700">{err}</p>}

      {reveal && state.my && (
        <div className="mt-8">
          <p className="font-serif text-2xl">
            {state.my.option_id === null ? "No answer in time." : state.my.correct ? `Correct. +${state.my.points} points.` : "Not this time."}
          </p>
          <p className="mt-1 text-muted">Your score: {state.my.score}</p>
          <h2 className="mb-3 mt-8 text-2xl">Leaderboard</h2>
          <Leaderboard sessionId={me.sessionId} refreshKey={key} meId={me.playerId} limit={5} />
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
      <div>
        <h1 className="text-4xl">Join this room first</h1>
        <Link href="/join" className="btn-primary mt-6">Enter a code</Link>
      </div>
    );
  }
  return <Game me={me} />;
}
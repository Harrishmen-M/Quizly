"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Option = { id: string; text: string };
export type GameState = {
  status: "waiting" | "active" | "finished";
  phase: "question" | "reveal";
  index: number;
  total: number;
  question?: { text: string; time_limit: number; remaining: number; options: Option[] };
  answered?: boolean;
  correct_option_id?: string;
  my?: { option_id: string | null; correct: boolean; points: number; score: number };
};

export function useSessionState(sessionId: string, playerId?: string) {
  const [state, setState] = useState<GameState | null>(null);
  const [receivedAt, setReceivedAt] = useState(0);

  const refresh = useCallback(async () => {
    const { data } = await createClient().rpc("session_state", { p_session: sessionId, p_player: playerId ?? null });
    if (data) { setState(data as GameState); setReceivedAt(performance.now()); }
  }, [sessionId, playerId]);

  useEffect(() => {
    const supabase = createClient();
    refresh();
    const channel = supabase
      .channel(`state-${sessionId}-${playerId ?? "host"}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "quiz_sessions", filter: `id=eq.${sessionId}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, playerId, refresh]);

  return { state, receivedAt, refresh };
}
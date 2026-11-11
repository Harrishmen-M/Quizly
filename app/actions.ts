"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";

type QuizInput = {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  questions: {
    text: string;
    options: string[];
    correct: number;
    time: number;
  }[];
};

export async function advanceGame(
  sessionId: string,
  phase: string,
  index: number,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("advance_session", {
    p_session: sessionId,
    p_phase: phase,
    p_index: index,
  });
  return error ? { error: "Could not advance the game." } : { ok: true };
}

export async function hostQuiz(
  quizId: string,
): Promise<{ code: string } | { error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Log in to host a quiz." };

  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("quiz_id", quizId);
  if (!count) return { error: "This quiz has no questions yet." };

  for (let i = 0; i < 5; i++) {
    const code = String(randomInt(100000, 1000000));
    const { error } = await supabase
      .from("quiz_sessions")
      .insert({ quiz_id: quizId, host_id: data.claims.sub, code });
    if (!error) return { code };
    if (error.code === "42501")
      return { error: "Only the creator can host this quiz." };
    if (error.code !== "23505") return { error: error.message };
  }
  return { error: "Could not open a room. Try again." };
}

export async function joinSession(
  code: string,
  nickname: string,
): Promise<{ playerId: string; sessionId: string } | { error: string }> {
  if (!/^\d{6}$/.test(code)) return { error: "Room codes are six digits." };
  const nick = nickname.trim();
  if (nick.length < 2 || nick.length > 20)
    return { error: "Nickname must be 2 to 20 characters." };

  const supabase = await createClient();
  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("id, status")
    .eq("code", code)
    .maybeSingle();
  if (!session) return { error: "No room with that code." };
  if (session.status !== "waiting")
    return { error: "That game has already started." };

  const { data: player, error } = await supabase
    .from("session_players")
    .insert({ session_id: session.id, nickname: nick })
    .select("id")
    .single();
  if (error)
    return {
      error:
        error.code === "23505"
          ? "That nickname is taken in this room."
          : "Could not join. Try again.",
    };
  return { playerId: player.id, sessionId: session.id };
}

export async function startSession(
  sessionId: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_sessions")
    .update({ status: "active" })
    .eq("id", sessionId)
    .eq("status", "waiting")
    .select("id");
  if (error || !data?.length) return { error: "Could not start the game." };
  return { ok: true };
}

export async function toggleStar(
  quizId: string,
): Promise<{ starred: boolean } | { error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Log in to star quizzes." };
  const userId = data.claims.sub;

  const { data: existing } = await supabase
    .from("quiz_stars")
    .select("quiz_id")
    .eq("quiz_id", quizId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from("quiz_stars")
      .delete()
      .eq("quiz_id", quizId)
      .eq("user_id", userId);
    return error ? { error: error.message } : { starred: false };
  }
  const { error } = await supabase
    .from("quiz_stars")
    .insert({ quiz_id: quizId, user_id: userId });
  if (error && error.code !== "23505")
    return { error: "Only public quizzes can be starred." };
  return { starred: true };
}

export async function createQuiz(
  input: QuizInput,
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Log in to save a quiz." };

  if (!input.title.trim()) return { error: "Give the quiz a title." };
  if (!input.questions.length) return { error: "Add at least one question." };
  for (const q of input.questions) {
    if (
      !q.text.trim() ||
      q.options.length !== 4 ||
      q.options.some((o) => !o.trim())
    )
      return { error: "Every question needs text and four options." };
  }

  const { data: quiz, error } = await supabase
    .from("quizzes")
    .insert({
      owner_id: data.claims.sub,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      is_public: input.isPublic,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const fail = async (message: string) => {
    await supabase.from("quizzes").delete().eq("id", quiz.id); // cascades to questions and options
    return { error: message };
  };

  const { data: qs, error: qErr } = await supabase
    .from("questions")
    .insert(
      input.questions.map((q, i) => ({
        quiz_id: quiz.id,
        position: i,
        text: q.text.trim(),
        time_limit: q.time,
      })),
    )
    .select("id, position");
  if (qErr) return fail(qErr.message);

  const rows = qs.flatMap((q) => {
    const src = input.questions[q.position];
    return src.options.map((text, i) => ({
      question_id: q.id,
      position: i,
      text: text.trim(),
      is_correct: i === src.correct,
    }));
  });
  const { error: oErr } = await supabase.from("options").insert(rows);
  if (oErr) return fail(oErr.message);

  return { id: quiz.id };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function setVisibility(
  quizId: string,
  isPublic: boolean,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Log in first." };
  const { data: rows, error } = await supabase
    .from("quizzes")
    .update({ is_public: isPublic })
    .eq("id", quizId)
    .eq("owner_id", data.claims.sub)
    .select("id");
  if (error || !rows?.length) return { error: "Could not update this quiz." };
  revalidatePath("/profile");
  revalidatePath("/explore");
  return { ok: true };
}

export async function deleteQuiz(
  quizId: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Log in first." };
  const { data: rows, error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId)
    .eq("owner_id", data.claims.sub)
    .select("id");
  if (error || !rows?.length) return { error: "Could not delete this quiz." };
  revalidatePath("/profile");
  revalidatePath("/explore");
  return { ok: true };
}

export async function updateName(
  name: string,
): Promise<{ ok: true } | { error: string }> {
  const clean = name.trim();
  if (clean.length < 2 || clean.length > 30)
    return { error: "Use 2 to 30 characters." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Log in first." };
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: clean })
    .eq("id", data.claims.sub);
  if (error) return { error: "Could not save your name." };
  revalidatePath("/profile");
  return { ok: true };
}

import { createClient } from "@/lib/supabase/server";
import type { Quiz } from "@/lib/mock";

const SELECT =
  "id, title, description, category, created_at, profiles!owner_id(display_name), questions(count), quiz_stars(count)";

function toQuiz(r: any): Quiz {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    creator: r.profiles?.display_name ?? "Unknown",
    category: r.category,
    questions: r.questions?.[0]?.count ?? 0,
    stars: r.quiz_stars?.[0]?.count ?? 0,
    created: String(r.created_at).slice(0, 10),
    prompts: [],
  };
}

export async function getQuizzes(
  opts: {
    q?: string;
    category?: string;
    sort?: "popular" | "recent";
    limit?: number;
  } = {},
): Promise<Quiz[]> {
  const { q = "", category = "All", sort = "popular", limit } = opts;
  const supabase = await createClient();
  let query = supabase.from("quizzes").select(SELECT).eq("is_public", true);
  if (category !== "All") query = query.eq("category", category);
  const term = q.replace(/[,()%*]/g, " ").trim();
  if (term)
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const list = (data ?? [])
    .map(toQuiz)
    .sort((a, b) =>
      sort === "popular"
        ? b.stars - a.stars || b.created.localeCompare(a.created)
        : b.created.localeCompare(a.created),
    );
  return limit ? list.slice(0, limit) : list;
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null; // also covers ids that aren't valid uuids
  const { data: qs } = await supabase
    .from("questions")
    .select("text")
    .eq("quiz_id", id)
    .order("position")
    .limit(3);
  return { ...toQuiz(data), prompts: (qs ?? []).map((x) => x.text) };
}

export async function getStarredQuizzes(userId: string): Promise<Quiz[]> {
  const supabase = await createClient();
  const { data: stars } = await supabase.from("quiz_stars").select("quiz_id").eq("user_id", userId);
  const ids = (stars ?? []).map((s) => s.quiz_id);
  if (!ids.length) return [];
  const { data, error } = await supabase.from("quizzes").select(SELECT).in("id", ids);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toQuiz).sort((a, b) => b.stars - a.stars);
}
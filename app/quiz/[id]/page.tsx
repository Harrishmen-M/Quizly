import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import StarButton from "@/components/StarButton";
import { getQuiz } from "@/lib/quizzes";
import { createClient } from "@/lib/supabase/server";
import HostButton from "@/components/HostButton";

async function Details({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await getQuiz(id);
  if (!quiz) notFound();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const { data: star } = userId
    ? await supabase
        .from("quiz_stars")
        .select("quiz_id")
        .eq("quiz_id", id)
        .eq("user_id", userId)
        .maybeSingle()
    : { data: null };
  const { data: own } = await supabase
    .from("quizzes")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();
  const isOwner = !!userId && own?.owner_id === userId;

  return (
    <>
      <h1 className="mt-4 max-w-2xl text-4xl sm:text-5xl">{quiz.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{quiz.description}</p>
      <dl className="mt-8 grid max-w-xl grid-cols-2 gap-y-4 border-y border-line py-5 text-sm sm:grid-cols-4">
        {[
          ["Creator", quiz.creator],
          ["Category", quiz.category],
          ["Questions", String(quiz.questions)],
          ["Created", quiz.created],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-muted">{k}</dt>
            <dd className="mt-0.5">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap items-start gap-3">
        {isOwner && <HostButton quizId={id} />}
        <StarButton
          quizId={id}
          count={quiz.stars}
          starred={!!star}
          signedIn={!!userId}
        />
      </div>
      <h2 className="mt-14 text-2xl">A taste of the questions</h2>
      <ul className="mt-3 max-w-xl border-t border-line">
        {quiz.prompts.map((p) => (
          <li key={p} className="border-b border-line py-4">
            {p}
          </li>
        ))}
        {quiz.questions > quiz.prompts.length && (
          <li className="py-4 text-muted">
            {quiz.questions - quiz.prompts.length} more. Answers stay hidden
            until you play.
          </li>
        )}
      </ul>
    </>
  );
}

export default function QuizDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <article className="wrap pt-14">
      <Link href="/explore" className="text-sm text-muted hover:text-ink">
        Back to explore
      </Link>
      <Suspense fallback={<p className="mt-8 text-muted">Loading quiz...</p>}>
        <Details params={params} />
      </Suspense>
    </article>
  );
}

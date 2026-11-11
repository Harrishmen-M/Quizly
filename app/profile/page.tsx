import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStarredQuizzes } from "@/lib/quizzes";
import QuizRow from "@/components/QuizRow";
import MyQuizRow, { type MyQuiz } from "@/components/MyQuizRow";
import EditName from "@/components/EditName";

const fmt = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const statusLabel: Record<string, string> = {
  waiting: "Waiting room",
  active: "In progress",
  finished: "Finished",
};

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-20 grid gap-6 lg:grid-cols-[13rem_1fr] lg:gap-16">
      <div>
        <h2 className="text-2xl tracking-[-0.02em]">{title}</h2>
        {hint && (
          <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">
            {hint}
          </p>
        )}
      </div>
      <div className="border-t border-line">{children}</div>
    </section>
  );
}

async function ProfileContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  const id = data.claims.sub;

  const [{ data: profile }, { data: mine }, { data: games }, starred] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, created_at")
        .eq("id", id)
        .single(),
      supabase
        .from("quizzes")
        .select(
          "id, title, is_public, created_at, questions(count), quiz_stars(count)",
        )
        .eq("owner_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("quiz_sessions")
        .select(
          "id, code, status, created_at, quizzes(title), session_players(count)",
        )
        .eq("host_id", id)
        .order("created_at", { ascending: false })
        .limit(10),
      getStarredQuizzes(id),
    ]);

  const myQuizzes: MyQuiz[] = (mine ?? []).map((q) => ({
    id: q.id,
    title: q.title,
    isPublic: q.is_public,
    questions: q.questions?.[0]?.count ?? 0,
    stars: q.quiz_stars?.[0]?.count ?? 0,
    created: fmt(q.created_at),
  }));
  const starsReceived = myQuizzes.reduce((n, q) => n + q.stars, 0);

  return (
    <>
      <EditName name={profile?.display_name ?? "Your profile"} />
      <p className="mt-2 text-muted">{data.claims.email}</p>
      <dl className="mt-8 grid max-w-lg grid-cols-2 gap-y-4 border-y border-line py-5 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted">Quizzes</dt>
          <dd className="mt-0.5">{myQuizzes.length}</dd>
        </div>
        <div>
          <dt className="text-muted">Stars received</dt>
          <dd className="mt-0.5">{starsReceived}</dd>
        </div>
        <div>
          <dt className="text-muted">Games hosted</dt>
          <dd className="mt-0.5">{games?.length ?? 0}</dd>
        </div>
        <div>
          <dt className="text-muted">Member since</dt>
          <dd className="mt-0.5">{profile ? fmt(profile.created_at) : ""}</dd>
        </div>
      </dl>

      <Section
        title="My quizzes"
        hint="Public quizzes appear in Explore. Private ones are visible only to you."
      >
        {myQuizzes.length ? (
          <ul>
            {myQuizzes.map((q) => (
              <MyQuizRow key={q.id} quiz={q} />
            ))}
          </ul>
        ) : (
          <div className="py-12">
            <p className="font-serif text-2xl">No quizzes yet.</p>
            <p className="mt-2 text-muted">
              Your first one takes a few minutes.
            </p>
            <Link href="/create" className="btn-primary mt-5">
              Create a quiz
            </Link>
          </div>
        )}
      </Section>

      <Section title="Hosted games" hint="Your ten most recent rooms.">
        {games?.length ? (
          <ul>
            {games.map((g) => (
              <li
                key={g.id}
                className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line py-4"
              >
                <div>
                  <p className="font-serif text-lg">
                    {(g.quizzes as unknown as { title: string } | null)
                      ?.title ?? "Deleted quiz"}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {fmt(g.created_at)}, {g.session_players?.[0]?.count ?? 0}{" "}
                    players, {statusLabel[g.status] ?? g.status}
                  </p>
                </div>
                <Link
                  href={`/host/${g.code}`}
                  className="text-sm underline underline-offset-4 hover:text-accent"
                >
                  {g.status === "finished" ? "Results" : "Open room"}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-12 text-muted">
            You haven't hosted a game yet. Open one of your quizzes and choose
            Host this quiz.
          </p>
        )}
      </Section>

      <Section title="Starred" hint="Quizzes you've starred.">
        {starred.length ? (
          <ul>
            {starred.map((q) => (
              <QuizRow key={q.id} quiz={q} />
            ))}
          </ul>
        ) : (
          <div className="py-12">
            <p className="text-muted">Nothing starred yet.</p>
            <Link href="/explore" className="btn-ghost mt-4">
              Explore quizzes
            </Link>
          </div>
        )}
      </Section>
    </>
  );
}

export default function Profile() {
  return (
    <div className="wrap pt-14">
      <Suspense fallback={<p className="text-muted">Loading profile...</p>}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}

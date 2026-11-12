import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStarredQuizzes } from "@/lib/quizzes";
import QuizRow from "@/components/QuizRow";
import MyQuizRow, { type MyQuiz } from "@/components/MyQuizRow";
import EditName from "@/components/EditName";

const fmt = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const statusLabel: Record<string, string> = { waiting: "Waiting room", active: "In progress", finished: "Finished" };
const statusStyle: Record<string, string> = {
  waiting: "border-line text-muted",
  active: "border-accent/30 bg-accent/10 text-accent",
  finished: "border-line text-muted",
};

function Section({ title, hint, count, children }: { title: string; hint?: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="mt-24 grid gap-6 lg:grid-cols-[13rem_1fr] lg:gap-16">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-2xl tracking-[-0.02em]">
          {title}
          {count !== undefined && <span className="ml-2 font-sans text-base text-muted">{count}</span>}
        </h2>
        {hint && <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">{hint}</p>}
      </div>
      <div className="border-t border-line">{children}</div>
    </section>
  );
}

function Empty({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-dashed border-line px-6 py-12 text-center">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-xs text-muted">{text}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

async function ProfileContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  const id = data.claims.sub;

  const [{ data: profile }, { data: mine }, { data: games }, starred] = await Promise.all([
    supabase.from("profiles").select("display_name, created_at").eq("id", id).single(),
    supabase
      .from("quizzes")
      .select("id, title, is_public, created_at, questions(count), quiz_stars(count)")
      .eq("owner_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("quiz_sessions")
      .select("id, code, status, created_at, quizzes(title), session_players(count)")
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
  const name = profile?.display_name ?? "Your profile";

  const stats: [string, string | number][] = [
    ["Quizzes", myQuizzes.length],
    ["Stars received", starsReceived],
    ["Games hosted", games?.length ?? 0],
    ["Member since", profile ? fmt(profile.created_at) : ""],
  ];

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-3xl text-paper" aria-hidden>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <EditName name={name} />
            <p className="mt-1 text-muted">{data.claims.email}</p>
          </div>
        </div>
        <Link href="/create" className="btn-primary h-11 self-start px-5 sm:self-auto">
          <Plus size={16} /> Create a quiz
        </Link>
      </div>

      <dl className="mt-12 grid grid-cols-2 border-y border-line sm:grid-cols-4 sm:divide-x sm:divide-line">
        {stats.map(([label, value], i) => (
          <div key={label} className={`py-6 sm:px-6 ${i === 0 ? "sm:pl-0" : ""} ${i < 2 ? "border-b border-line sm:border-b-0" : ""}`}>
            <dd className="font-serif text-4xl tracking-tight">{value}</dd>
            <dt className="mt-1 text-sm text-muted">{label}</dt>
          </div>
        ))}
      </dl>

      <Section title="My quizzes" count={myQuizzes.length} hint="Public quizzes appear in Explore. Private ones are visible only to you.">
        {myQuizzes.length ? (
          <ul>{myQuizzes.map((q) => <MyQuizRow key={q.id} quiz={q} />)}</ul>
        ) : (
          <Empty title="No quizzes yet." text="Your first one takes a few minutes.">
            <Link href="/create" className="btn-primary">Create a quiz</Link>
          </Empty>
        )}
      </Section>

      <Section title="Hosted games" hint="Your ten most recent rooms.">
        {games?.length ? (
          <ul>
            {games.map((g) => (
              <li key={g.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-5">
                <div>
                  <p className="font-serif text-xl">
                    {(g.quizzes as unknown as { title: string } | null)?.title ?? "Deleted quiz"}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                    <span>{fmt(g.created_at)}</span>
                    <span>{g.session_players?.[0]?.count ?? 0} players</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${statusStyle[g.status] ?? "border-line"}`}>
                      {statusLabel[g.status] ?? g.status}
                    </span>
                  </p>
                </div>
                <Link href={`/host/${g.code}`} className="btn-ghost h-9">
                  {g.status === "finished" ? "Results" : "Open room"}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="No games yet." text="Open one of your quizzes and choose Host this quiz." />
        )}
      </Section>

      <Section title="Starred" count={starred.length} hint="Quizzes you've starred.">
        {starred.length ? (
          <ul>{starred.map((q) => <QuizRow key={q.id} quiz={q} />)}</ul>
        ) : (
          <Empty title="Nothing starred yet." text="Star a quiz in Explore and it will show up here.">
            <Link href="/explore" className="btn-ghost">Explore quizzes</Link>
          </Empty>
        )}
      </Section>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-ink/10" />
        <div>
          <div className="h-8 w-48 rounded bg-ink/10" />
          <div className="mt-2 h-4 w-36 rounded bg-ink/5" />
        </div>
      </div>
      <div className="mt-12 h-24 border-y border-line" />
    </div>
  );
}

export default function Profile() {
  return (
    <div className="wrap pt-14">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
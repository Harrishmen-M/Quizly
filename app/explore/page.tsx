import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import QuizRow from "@/components/QuizRow";
import { categories } from "@/lib/mock";
import { getQuizzes } from "@/lib/quizzes";

type Params = { q?: string; category?: string; sort?: string };

async function Content({ searchParams }: { searchParams: Promise<Params> }) {
  const { q = "", category = "All", sort = "popular" } = await searchParams;
  const sortKey = sort === "recent" ? "recent" : "popular";
  const quizzes = await getQuizzes({ q, category, sort: sortKey });

  const href = (over: Partial<Params>) => {
    const m = { q, category, sort: sortKey, ...over };
    const p = new URLSearchParams();
    if (m.q) p.set("q", m.q);
    if (m.category && m.category !== "All") p.set("category", m.category);
    if (m.sort !== "popular") p.set("sort", m.sort);
    const s = p.toString();
    return `/explore${s ? `?${s}` : ""}`;
  };
  const chip = (active: boolean) => `rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`;

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <form action="/explore" className="relative flex-1">
          {category !== "All" && <input type="hidden" name="category" value={category} />}
          {sortKey !== "popular" && <input type="hidden" name="sort" value={sortKey} />}
          <label className="sr-only" htmlFor="q">Search quizzes</label>
          <Search size={16} className="absolute left-3 top-3 text-muted" />
          <input id="q" name="q" defaultValue={q} className="input pl-9" placeholder="Search by title or topic" />
        </form>
        <div className="flex gap-2">
          <Link href={href({ sort: "popular" })} className={chip(sortKey === "popular")}>Most popular</Link>
          <Link href={href({ sort: "recent" })} className={chip(sortKey === "recent")}>Recently created</Link>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["All", ...categories].map((c) => <Link key={c} href={href({ category: c })} className={chip(category === c)}>{c}</Link>)}
      </div>
      {quizzes.length ? (
        <ul className="mt-8 border-t border-line">{quizzes.map((x) => <QuizRow key={x.id} quiz={x} />)}</ul>
      ) : (
        <div className="mt-8 border-t border-line py-20 text-center">
          <p className="font-serif text-2xl">Nothing here yet.</p>
          <p className="mt-2 text-muted">No public quizzes match. Try another word, or write the quiz yourself.</p>
          <Link href="/create" className="btn-primary mt-6">Create a quiz</Link>
        </div>
      )}
    </>
  );
}

export default function Explore({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <div className="wrap pt-14">
      <h1 className="text-4xl sm:text-5xl">Explore quizzes</h1>
      <Suspense fallback={<p className="mt-8 text-muted">Loading quizzes...</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
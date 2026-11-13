import { Suspense } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import QuizRow from "@/components/QuizRow";
import { categories } from "@/lib/mock";
import { getQuizzes } from "@/lib/quizzes";

type Params = { q?: string; category?: string; sort?: string };

function ListSkeleton() {
  return (
    <ul className="mt-8 border-t border-line" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="border-b border-line py-7">
          <div className="h-6 w-2/5 animate-pulse rounded bg-ink/10" />
          <div className="mt-3 h-4 w-3/5 animate-pulse rounded bg-ink/5" />
        </li>
      ))}
    </ul>
  );
}

async function Content({ searchParams }: { searchParams: Promise<Params> }) {
  const { q = "", category = "All", sort = "popular" } = await searchParams;
  const sortKey = sort === "recent" ? "recent" : "popular";
  const quizzes = await getQuizzes({ q, category, sort: sortKey });
  const filtered = q !== "" || category !== "All";

  const href = (over: Partial<Params>) => {
    const m = { q, category, sort: sortKey, ...over };
    const p = new URLSearchParams();
    if (m.q) p.set("q", m.q);
    if (m.category && m.category !== "All") p.set("category", m.category);
    if (m.sort !== "popular") p.set("sort", m.sort);
    const s = p.toString();
    return `/explore${s ? `?${s}` : ""}`;
  };

  const chip = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
      active ? "border-ink bg-ink text-paper" : "border-line bg-white/60 text-muted hover:border-ink hover:text-ink"
    }`;
  const seg = (active: boolean) =>
    `rounded-md px-4 py-2 text-sm transition ${active ? "bg-ink text-paper" : "text-muted hover:text-ink"}`;

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <form action="/explore" className="relative flex-1">
          {category !== "All" && <input type="hidden" name="category" value={category} />}
          {sortKey !== "popular" && <input type="hidden" name="sort" value={sortKey} />}
          <label className="sr-only" htmlFor="q">Search quizzes</label>
          <Search size={18} className="pointer-events-none absolute left-4 top-3.5 text-muted" />
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search by title or topic"
            className="input h-12 pl-11 pr-28 text-base"
          />
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
            {q && (
              <Link href={href({ q: "" })} prefetch={false} aria-label="Clear search" className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink">
                <X size={16} />
              </Link>
            )}
            <button className="btn-primary h-9 px-4">Search</button>
          </div>
        </form>

        <div className="inline-flex self-start rounded-lg border border-line bg-white p-1" role="group" aria-label="Sort">
          <Link href={href({ sort: "popular" })} prefetch={false} aria-current={sortKey === "popular"} className={seg(sortKey === "popular")}>Most popular</Link>
          <Link href={href({ sort: "recent" })} prefetch={false} aria-current={sortKey === "recent"} className={seg(sortKey === "recent")}>Recently created</Link>
        </div>
      </div>

      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {["All", ...categories].map((c) => (
          <Link key={c} href={href({ category: c })} prefetch={false} className={chip(category === c)}>{c}</Link>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted" aria-live="polite">
        {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
        {category !== "All" && <> in {category}</>}
        {q && <> matching “{q}”</>}
      </p>

      {quizzes.length ? (
        <ul className="mt-3 border-t border-line">{quizzes.map((x) => <QuizRow key={x.id} quiz={x} />)}</ul>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-line px-6 py-20 text-center">
          <p className="font-serif text-3xl">{filtered ? "No quizzes match that." : "Nothing here yet."}</p>
          <p className="mx-auto mt-3 max-w-sm text-muted">
            {filtered ? "Try a different word or topic, or clear your filters." : "Be the first to publish a quiz for others to play."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {filtered && <Link href="/explore" prefetch={false} className="btn-ghost">Clear filters</Link>}
            <Link href="/create" prefetch={false} className="btn-primary">Create a quiz</Link>
          </div>
        </div>
      )}
    </>
  );
}

export default function Explore({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <div className="wrap pt-14">
      <h1 className="text-4xl tracking-[-0.03em] sm:text-5xl">Explore quizzes</h1>
      <p className="mt-2 max-w-md text-muted">Public quizzes from the community. Find one, star it, or host it for your own group.</p>
      <Suspense fallback={<ListSkeleton />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
import { Suspense } from "react";
import Link from "next/link";
import QuizRow from "@/components/QuizRow";
import DemoQuestion from "@/components/DemoQuestion";
import { getQuizzes } from "@/lib/quizzes";
import { categories } from "@/lib/mock";

const steps = [
  [
    "Write it",
    "Add questions with four options each, and set how long players get to answer.",
  ],
  [
    "Host it",
    "Open a room and share the six-digit code. Players join with a nickname.",
  ],
  [
    "Play it",
    "Everyone answers on their own screen. Scores and rankings update after every question.",
  ],
];

async function Popular() {
  const popular = await getQuizzes({ sort: "popular", limit: 4 });
  if (!popular.length) {
    return (
      <p className="border-t border-line py-10 text-muted">
        No public quizzes yet. Be the first to make one.
      </p>
    );
  }
  return (
    <ul className="border-t border-line">
      {popular.map((q) => (
        <QuizRow key={q.id} quiz={q} />
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      <section className="wrap grid gap-20 pt-16 sm:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h1 className="max-w-xl text-5xl leading-[1] tracking-[-0.04em] sm:text-7xl lg:text-[5.25rem]">
            Where Every Answer Is an Adventure.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted">
            Build a quiz, share the code, and see who claims the crown!
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/create" className="btn-primary h-12 px-6 text-base">
              Create a quiz
            </Link>
            <Link href="/explore" className="btn-ghost h-12 px-6 text-base">
              Explore quizzes
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            Free for students and teachers. Runs in any browser.
          </p>
        </div>

        <div className="relative lg:pb-10 lg:pl-10">
          <DemoQuestion />
          <div className="mt-4 rounded-xl border border-line bg-paper p-4 shadow-[0_16px_32px_-16px_rgba(28,27,25,0.25)] lg:absolute lg:-bottom-2 lg:left-0 lg:mt-0 lg:w-56">
            <p className="text-xs text-muted">Example room, join with code</p>
            <p className="mt-1 font-serif text-3xl tracking-[0.14em]">
              482 917
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Players
              appear here as they join
            </p>
          </div>
        </div>
      </section>

      <section className="wrap mt-32 grid gap-8 lg:mt-48 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <div>
          <h2 className="text-3xl tracking-[-0.02em]">Popular right now</h2>
          <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-muted">
            The most-starred public quizzes from the library.
          </p>
          <Link
            href="/explore"
            className="mt-5 inline-block text-sm underline underline-offset-4 hover:text-accent"
          >
            See all quizzes
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="border-t border-line py-10 text-muted">
              Loading...
            </div>
          }
        >
          <Popular />
        </Suspense>
      </section>

      <section className="wrap mt-24 grid gap-8 lg:mt-32 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <h2 className="text-3xl tracking-[-0.02em]">Browse by topic</h2>
        <div className="flex flex-wrap gap-2 border-t border-line pt-8">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/explore?category=${encodeURIComponent(c)}`}
              className="rounded-full border border-line bg-white/60 px-5 py-2.5 transition hover:border-ink hover:bg-white"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap mt-32 grid gap-8 lg:mt-48 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <h2 className="text-3xl tracking-[-0.02em]">How a game works</h2>
        <ol className="border-t border-line">
          {steps.map(([title, text], i) => (
            <li
              key={title}
              className="grid items-baseline gap-x-6 gap-y-1 border-b border-line py-9 sm:grid-cols-[4rem_9rem_1fr]"
            >
              <span className="font-serif text-5xl text-accent/70">
                {i + 1}
              </span>
              <span className="font-serif text-2xl">{title}</span>
              <span className="max-w-md leading-relaxed text-muted">
                {text}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap mt-32 lg:mt-48">
        <div className="rounded-2xl bg-ink px-8 py-14 text-paper sm:px-14 sm:py-20">
          <h2 className="max-w-lg text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">
            Write your first quiz today.
          </h2>
          <p className="mt-4 max-w-md text-paper/60">
            It takes a few minutes, and your players only need a browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="btn h-12 bg-paper px-6 text-base text-ink hover:bg-white"
            >
              Create a quiz
            </Link>
            <Link
              href="/explore"
              className="btn h-12 px-6 text-base text-paper/70 hover:text-paper"
            >
              Explore first
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

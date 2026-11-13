import { Suspense } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import QuizRow from "@/components/QuizRow";
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

const faqs = [
  [
    "Do players need an account to join?",
    "No. Players only need the room code and a nickname. You need an account to create and host quizzes.",
  ],
  [
    "How does the room code work?",
    "When you host a quiz, Quizly opens a room and gives you a six-digit code. Share it, and players enter it on the join page to appear in the waiting room.",
  ],
  [
    "What goes into a question?",
    "Each question has four answer options, and you set how long players get to answer. You can write as many questions as your quiz needs.",
  ],
  [
    "What do players need to play?",
    "Just a browser. Everyone answers on their own phone, tablet or laptop, so there is nothing to install.",
  ],
  [
    "Is Quizly free?",
    "It is free for students and teachers. Public quizzes also appear in the library, where other people can find and play them.",
  ],
];

// Pixel crown for the hero. X = filled tile, . = empty tile.
// Row 0 holds the three tips, which are drawn in the accent colour.
const crown = [
  "X..X..X",
  "XX.X.XX",
  "XXXXXXX",
  "XXXXXXX",
  ".......",
  "XXXXXXX",
];

// Staggers the one page-load reveal in the hero (see .rise in globals.css).
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

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
    <ul className="border-t border-ink/80">
      {popular.map((q) => (
        <QuizRow key={q.id} quiz={q} />
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate">
        {/* Fine grid that fades out toward the bottom of the hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] [background-image:linear-gradient(to_right,rgba(28,27,25,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,27,25,0.045)_1px,transparent_1px)] [background-position:center_top] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,black,transparent)]"
        />

        <div className="wrap grid gap-20 pt-20 sm:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1
              className="rise max-w-2xl text-[3.25rem] leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-[5.75rem]"
              style={delay(0)}
            >
              Where every answer is an adventure.
            </h1>
            <p
              className="rise mt-8 max-w-md text-lg leading-relaxed text-muted"
              style={delay(120)}
            >
              Build a quiz, share the code, and see who takes the crown.
            </p>
            <div className="rise mt-10 flex flex-wrap gap-3" style={delay(220)}>
              <Link href="/create" className="btn-primary h-12 px-7 text-base">
                Create a quiz
              </Link>
              <Link href="/explore" className="btn-ghost h-12 px-7 text-base">
                Explore quizzes
              </Link>
            </div>
          </div>

          <div className="lg:pl-8" aria-hidden>
            <div className="mx-auto grid w-full max-w-[26rem] grid-cols-7 gap-1.5 sm:gap-2 lg:ml-auto lg:mr-0">
              {crown.flatMap((row, r) =>
                row.split("").map((cell, c) => {
                  const filled = cell === "X";
                  const tip = filled && r === 0;
                  return (
                    <span
                      key={`${r}-${c}`}
                      className={
                        filled
                          ? `rise aspect-square rounded-[0.4rem] transition-colors duration-300 hover:bg-accent ${
                              tip ? "bg-accent" : "bg-ink"
                            }`
                          : "aspect-square rounded-[0.4rem] border border-line/70"
                      }
                      style={
                        filled ? delay(300 + (5 - r) * 120 + c * 30) : undefined
                      }
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="wrap mt-36 grid gap-10 lg:mt-52 lg:grid-cols-[14rem_1fr] lg:gap-20">
        <div>
          <h2 className="text-4xl leading-[1.05] tracking-[-0.03em]">
            Popular right now
          </h2>
          <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted">
            The most-starred public quizzes from the library.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-block text-sm underline decoration-line underline-offset-4 transition hover:text-accent hover:decoration-accent"
          >
            See all quizzes
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="border-t border-ink/80 py-10 text-muted">
              Loading...
            </div>
          }
        >
          <Popular />
        </Suspense>
      </section>

      {/* Topics */}
      <section className="wrap mt-28 grid gap-10 lg:mt-40 lg:grid-cols-[14rem_1fr] lg:gap-20">
        <h2 className="text-4xl leading-[1.05] tracking-[-0.03em]">
          Browse by topic
        </h2>
        <div className="flex flex-wrap gap-2.5 border-t border-ink/80 pt-8">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/explore?category=${encodeURIComponent(c)}`}
              className="rounded-full border border-line bg-white/60 px-5 py-2.5 text-[0.95rem] transition duration-200 hover:border-ink hover:bg-ink hover:text-paper"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* How a game works: a true sequence, so the numerals stay */}
      <section className="wrap mt-36 lg:mt-52">
        <h2 className="max-w-md text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl">
          How a game works
        </h2>
        <ol className="mt-12 grid overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3 md:gap-px">
          {steps.map(([title, text], i) => (
            <li
              key={title}
              className="flex flex-col justify-between gap-16 bg-paper p-8 sm:p-10"
            >
              <span className="font-serif text-6xl leading-none text-accent/80">
                {i + 1}
              </span>
              <div>
                <h3 className="font-serif text-3xl tracking-[-0.015em]">
                  {title}
                </h3>
                <p className="mt-3 max-w-xs leading-relaxed text-muted">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section className="wrap mt-36 pb-4 lg:mt-52">
        <div className="relative isolate overflow-hidden rounded-3xl bg-ink px-8 py-16 text-paper ring-1 ring-inset ring-white/10 sm:px-16 sm:py-24">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-6 -z-10 hidden select-none font-serif text-[15rem] leading-none tracking-[0.04em] text-paper/[0.045] lg:block"
          >
            482 917
          </span>
          <h2 className="max-w-xl text-5xl leading-[1] tracking-[-0.035em] sm:text-6xl">
            Write your first quiz today.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-paper/60">
            It takes a few minutes, and your players only need a browser.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="btn h-12 bg-paper px-7 text-base text-ink transition hover:bg-white"
            >
              Create a quiz
            </Link>
            <Link
              href="/explore"
              className="btn h-12 px-7 text-base text-paper/70 transition hover:text-paper"
            >
              Explore first
            </Link>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="wrap mt-36 grid gap-10 pb-24 lg:mt-52 lg:grid-cols-[14rem_1fr] lg:gap-20 lg:pb-32">
        <div>
          <h2 className="text-4xl leading-[1.05] tracking-[-0.03em]">
            Common questions
          </h2>
          <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted">
            Short answers about joining, hosting and pricing.
          </p>
        </div>
        <div className="border-t border-ink/80">
          {faqs.map(([question, answer], i) => (
            <details
              key={question}
              className="group border-b border-line"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-6 font-serif text-xl tracking-[-0.01em] transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-2xl [&::-webkit-details-marker]:hidden">
                {question}
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                >
                  <path d="M10 3v14M3 10h14" />
                </svg>
              </summary>
              <p className="max-w-xl pb-7 leading-relaxed text-muted">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import QuizRow from "@/components/QuizRow";
import DemoQuestion from "@/components/DemoQuestion";
import { getQuizzes } from "@/lib/quizzes";

const steps = [
  ["Write it", "Add questions with four options each, and set how long players get to answer."],
  ["Host it", "Open a room and share the six-digit code. Players join with a nickname."],
  ["Play it", "Everyone answers on their own screen. Scores and rankings update after every question."],
];

async function Popular() {
  const popular = await getQuizzes({ sort: "popular", limit: 4 });
  if (!popular.length) {
    return <p className="border-t border-line py-10 text-muted">No public quizzes yet. Be the first to make one.</p>;
  }
  return (
    <ul className="border-t border-line">
      {popular.map((q) => <QuizRow key={q.id} quiz={q} />)}
    </ul>
  );
}

export default function Home() {
  return (
    <>
      <section className="wrap grid gap-16 pt-20 sm:pt-32 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <h1 className="max-w-xl text-5xl leading-[1.02] tracking-[-0.035em] sm:text-7xl">
            Quizzes people actually want to finish.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted">
            Write a quiz in minutes, host it live for a lecture hall or a study group, and see who knows the material best.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/create" className="btn-primary h-12 px-6 text-base">Create a quiz</Link>
            <Link href="/explore" className="btn-ghost h-12 px-6 text-base">Explore quizzes</Link>
          </div>
          <p className="mt-5 text-sm text-muted">Free for students and teachers. Runs in the browser.</p>
        </div>
        <DemoQuestion />
      </section>

      <section className="wrap mt-32 grid gap-8 lg:mt-44 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <div>
          <h2 className="text-3xl tracking-[-0.02em]">Popular right now</h2>
          <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-muted">The most-starred public quizzes from the library.</p>
          <Link href="/explore" className="mt-5 inline-block text-sm underline underline-offset-4 hover:text-accent">See all quizzes</Link>
        </div>
        <Suspense fallback={<div className="border-t border-line py-10 text-muted">Loading...</div>}>
          <Popular />
        </Suspense>
      </section>

      <section className="wrap mt-32 grid gap-8 lg:mt-44 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <h2 className="text-3xl tracking-[-0.02em]">How a game works</h2>
        <ol className="border-t border-line">
          {steps.map(([title, text], i) => (
            <li key={title} className="grid items-baseline gap-x-6 gap-y-1 border-b border-line py-8 sm:grid-cols-[3.5rem_9rem_1fr]">
              <span className="font-serif text-4xl text-muted/50">{i + 1}</span>
              <span className="font-serif text-2xl">{title}</span>
              <span className="max-w-md leading-relaxed text-muted">{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap mt-32 lg:mt-44">
        <div className="flex flex-col justify-between gap-8 border-t border-line pt-16 sm:flex-row sm:items-end">
          <h2 className="max-w-md text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">Write your first quiz today.</h2>
          <Link href="/create" className="btn-primary h-12 px-6 text-base">Create a quiz</Link>
        </div>
      </section>
    </>
  );
}
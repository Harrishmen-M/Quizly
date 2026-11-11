"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteQuiz, setVisibility } from "@/app/actions";

export type MyQuiz = { id: string; title: string; isPublic: boolean; questions: number; stars: number; created: string };

export default function MyQuizRow({ quiz }: { quiz: MyQuiz }) {
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: true } | { error: string }>) {
    setErr("");
    start(async () => {
      const res = await fn();
      if ("error" in res) setErr(res.error);
      setConfirming(false);
    });
  }

  return (
    <li className="border-b border-line py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={`/quiz/${quiz.id}`} className="font-serif text-xl hover:text-accent">{quiz.title}</Link>
          <p className="mt-1 text-sm text-muted">
            {quiz.isPublic ? "Public" : "Private"}, {quiz.questions} questions, {quiz.stars} stars, created {quiz.created}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button disabled={pending} onClick={() => run(() => setVisibility(quiz.id, !quiz.isPublic))} className="btn-ghost h-9 disabled:opacity-60">
            {quiz.isPublic ? "Make private" : "Make public"}
          </button>
          {confirming ? (
            <>
              <span className="text-muted">Delete this quiz and its games?</span>
              <button disabled={pending} onClick={() => run(() => deleteQuiz(quiz.id))} className="btn-ghost h-9 border-red-300 text-red-700 disabled:opacity-60">Yes, delete</button>
              <button onClick={() => setConfirming(false)} className="btn-ghost h-9">Cancel</button>
            </>
          ) : (
            <button onClick={() => setConfirming(true)} className="btn-ghost h-9">Delete</button>
          )}
        </div>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
    </li>
  );
}
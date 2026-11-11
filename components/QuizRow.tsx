import Link from "next/link";
import { Star } from "lucide-react";
import type { Quiz } from "@/lib/mock";

export default function QuizRow({ quiz }: { quiz: Quiz }) {
  return (
    <li className="border-b border-line">
      <Link href={`/quiz/${quiz.id}`} className="group grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:gap-10">
        <div>
          <h3 className="text-2xl leading-snug group-hover:text-accent">{quiz.title}</h3>
          <p className="mt-1 max-w-xl text-muted">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-5 text-sm text-muted sm:flex-col sm:items-end sm:justify-center sm:gap-1">
          <span>{quiz.creator}</span>
          <span>{quiz.category}, {quiz.questions} questions</span>
          <span className="inline-flex items-center gap-1 text-ink"><Star size={14} /> {quiz.stars}</span>
        </div>
      </Link>
    </li>
  );
}

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-28 bg-[#171717] text-white">
      <div className="wrap">
        {/* Main footer */}
        <div className="flex flex-col justify-between gap-12 py-16 sm:flex-row sm:items-start">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-block font-serif text-3xl tracking-tight text-white"
            >
              Quizly<span className="text-accent">.</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-7 text-white/50">
              Quizzes people actually want to finish.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-14 sm:gap-24">
            <div>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                Discover
              </h3>

              <div className="flex flex-col gap-4 text-sm text-white/50">
                <Link
                  href="/explore"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Explore quizzes
                </Link>

                <Link
                  href="/join"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Join a game
                </Link>
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                Create
              </h3>

              <div className="flex flex-col gap-4 text-sm text-white/50">
                <Link
                  href="/create"
                  className="group inline-flex items-center gap-1 transition-colors duration-200 hover:text-white"
                >
                  Create a quiz
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Quizly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

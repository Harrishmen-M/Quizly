import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions";
import MobileMenu from "@/components/MobileMenu";
import { UserRound } from "lucide-react";

export default async function Nav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-xl">
      <nav className="wrap flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Quizly<span className="text-accent">.</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 text-sm md:flex">
          <Link
            href="/explore"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-ink/5"
          >
            Explore
          </Link>

          <Link
            href="/create"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-ink/5"
          >
            Create
          </Link>

          <Link
            href="/join"
            className="rounded-lg px-3 py-2 transition-colors hover:bg-ink/5"
          >
            Join
          </Link>

          {signedIn ? (
            <>
              <Link
                href="/profile"
                className="rounded-lg px-3 py-2 transition-colors hover:bg-ink/5"
              >
                Profile
              </Link>

              <form action={logout}>
                <button className="btn-ghost ml-1 h-9">Log out</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-ghost ml-1 h-9">
              Log in
            </Link>
          )}
        </div>

        {/* Mobile navigation */}
        <div className="flex items-center gap-2 md:hidden">
          {signedIn && (
            <Link
              href="/profile"
              aria-label="Profile"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line transition-colors hover:bg-ink/5"
            >
              <UserRound size={19} strokeWidth={1.7} />
            </Link>
          )}

          <MobileMenu signedIn={signedIn} />
        </div>
      </nav>
    </header>
  );
}

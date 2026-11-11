import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions";

export default async function Nav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;

  return (
    <header className="border-b border-line">
      <nav className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Quizly<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-1 text-sm sm:gap-2">
          <Link
            href="/explore"
            className="rounded-md px-2 py-2 hover:bg-ink/5 sm:px-3"
          >
            Explore
          </Link>
          <Link
            href="/create"
            className="rounded-md px-2 py-2 hover:bg-ink/5 sm:px-3"
          >
            Create
          </Link>
          <Link
            href="/join"
            className="hidden rounded-md px-3 py-2 hover:bg-ink/5 sm:block"
          >
            Join
          </Link>
          {signedIn ? (
            <>
              <Link
                href="/profile"
                className="rounded-md px-2 py-2 hover:bg-ink/5 sm:px-3"
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
      </nav>
    </header>
  );
}

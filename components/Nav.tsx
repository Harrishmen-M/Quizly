import Link from "next/link";
import { UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions";
import MobileMenu from "@/components/MobileMenu";

const plain =
  "rounded-full px-4 py-2.5 font-medium text-muted transition-colors duration-200 hover:bg-ink/5 hover:text-ink";
const solid =
  "ml-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors duration-200 hover:bg-ink/85";

export default async function Nav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-xl">
      <nav className="wrap flex h-[72px] items-center justify-between gap-4">
        <Link
          href="/"
          className="group font-serif text-[27px] tracking-tight text-ink"
        >
          Quizly
          <span className="text-accent transition-opacity group-hover:opacity-70">
            .
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 text-sm md:flex">
          <Link href="/explore" className={plain}>
            Explore
          </Link>
          <Link href="/join" className={plain}>
            Join
          </Link>
          {signedIn ? (
            <>
              <Link href="/profile" prefetch={false} className={plain}>
                Profile
              </Link>
              <Link href="/create" prefetch={false} className={solid}>
                Create a quiz
              </Link>
              <form action={logout}>
                <button className={`ml-1 ${plain}`}>Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={plain}>
                Log in
              </Link>
              <Link href="/create" prefetch={false} className={solid}>
                Create a quiz
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {signedIn && (
            <Link
              href="/profile"
              prefetch={false}
              aria-label="Profile"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors duration-200 hover:border-ink hover:bg-ink/5"
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

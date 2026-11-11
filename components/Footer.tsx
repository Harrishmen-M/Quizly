import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line py-10 text-sm text-muted">
      <div className="wrap flex flex-col justify-between gap-4 sm:flex-row">
        <p>Quizly. A university web development project.</p>
        <div className="flex gap-5">
          <Link href="/explore" className="hover:text-ink">Explore</Link>
          <Link href="/create" className="hover:text-ink">Create</Link>
          <Link href="/join" className="hover:text-ink">Join a game</Link>
        </div>
      </div>
    </footer>
  );
}

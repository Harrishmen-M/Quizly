"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { joinSession } from "@/app/actions";

export default function Join() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [nick, setNick] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setErr("Room codes are six digits.");
    if (nick.trim().length < 2) return setErr("Pick a nickname of at least 2 characters.");
    setErr(""); setBusy(true);
    const res = await joinSession(code, nick);
    setBusy(false);
    if ("error" in res) return setErr(res.error);
    try { sessionStorage.setItem("quizly-player", JSON.stringify({ ...res, code, nickname: nick.trim() })); } catch {}
    router.push(`/play/${code}`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-14 sm:pt-24">
      <div className="rounded-2xl border border-line bg-white p-7 shadow-[0_24px_48px_-24px_rgba(28,27,25,0.18)] sm:p-9">
        <h1 className="text-4xl tracking-[-0.03em]">Join a game</h1>
        <p className="mt-2 text-muted">Enter the six-digit code on the host's screen.</p>

        <form onSubmit={submit} className="mt-8" noValidate>
          <div className="text-sm">Room code</div>
          <div className="relative mt-2 cursor-text" onClick={() => inputRef.current?.focus()}>
            <div className="grid grid-cols-6 gap-2 sm:gap-3" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => {
                const active = focused && i === Math.min(code.length, 5);
                return (
                  <div key={i} className={`flex h-14 items-center justify-center rounded-lg border bg-paper font-serif text-3xl transition sm:h-16 ${active ? "border-ink bg-white ring-4 ring-ink/5" : "border-line"}`}>
                    {code[i] ?? ""}
                  </div>
                );
              })}
            </div>
            <input
              ref={inputRef}
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label="Room code"
              className="absolute inset-0 h-full w-full cursor-text opacity-0"
            />
          </div>

          <label className="mt-5 block text-sm">
            Nickname
            <input value={nick} onChange={(e) => setNick(e.target.value)} maxLength={20} placeholder="What should we call you?" className="input mt-2 h-12 text-base" />
          </label>

          {err && <p role="alert" className="mt-4 text-sm text-red-700">{err}</p>}

          <button disabled={busy} className="btn-primary mt-6 h-12 w-full text-base disabled:opacity-60">
            {busy ? "Joining..." : "Join game"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        No account needed to play. Want to run your own?{" "}
        <Link href="/create" className="text-ink underline underline-offset-4 hover:text-accent">Create a quiz</Link>
      </p>
    </div>
  );
}
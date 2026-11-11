"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinSession } from "@/app/actions";

export default function Join() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [nick, setNick] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

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
    <div className="mx-auto w-full max-w-sm px-5 pt-16 sm:pt-24">
      <h1 className="text-4xl">Join a game</h1>
      <p className="mt-2 text-muted">Enter the code on the host's screen.</p>
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <label className="block text-sm">Room code
          <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" className="input mt-1.5 h-14 text-center font-serif text-3xl tracking-[0.3em]" />
        </label>
        <label className="block text-sm">Nickname
          <input value={nick} onChange={(e) => setNick(e.target.value)} maxLength={20} className="input mt-1.5" />
        </label>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? "Joining..." : "Join"}</button>
      </form>
    </div>
  );
}
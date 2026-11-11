"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { hostQuiz } from "@/app/actions";

export default function HostButton({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function click() {
    setBusy(true); setErr("");
    const res = await hostQuiz(quizId);
    if ("error" in res) { setBusy(false); return setErr(res.error); }
    router.push(`/host/${res.code}`);
  }

  return (
    <div>
      <button onClick={click} disabled={busy} className="btn-primary disabled:opacity-60">{busy ? "Opening room..." : "Host this quiz"}</button>
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
    </div>
  );
}
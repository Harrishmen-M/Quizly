"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { categories } from "@/lib/mock";
import { createQuiz } from "@/app/actions";

type Q = { id: number; text: string; options: string[]; correct: number; time: number };

const blank = (id: number): Q => ({ id, text: "", options: ["", "", "", ""], correct: 0, time: 20 });
const complete = (q: Q) => q.text.trim() !== "" && q.options.every((o) => o.trim() !== "");

export default function Create() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [qs, setQs] = useState<Q[]>([blank(1)]);
  const [next, setNext] = useState(2);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const patch = (id: number, p: Partial<Q>) => setQs(qs.map((q) => (q.id === id ? { ...q, ...p } : q)));
  const setOpt = (q: Q, i: number, v: string) => patch(q.id, { options: q.options.map((o, j) => (j === i ? v : o)) });
  const done = qs.filter(complete).length;

  async function save() {
    if (!title.trim()) return setMsg("Give the quiz a title.");
    const bad = qs.findIndex((q) => !complete(q));
    if (bad >= 0) return setMsg(`Question ${bad + 1} needs text and all four options.`);

    setMsg("");
    setSaving(true);
    const res = await createQuiz({
      title, description, category, isPublic,
      questions: qs.map(({ text, options, correct, time }) => ({ text, options, correct, time })),
    });
    setSaving(false);
    if ("error" in res) return setMsg(res.error);
    router.push("/profile");
  }

  const seg = (active: boolean) =>
    `rounded-md px-4 py-2 text-sm transition ${active ? "bg-ink text-paper" : "text-muted hover:text-ink"}`;

  return (
    <div className="pt-14">
      <div className="wrap max-w-3xl">
        <h1 className="text-4xl tracking-[-0.03em] sm:text-5xl">Create a quiz</h1>
        <p className="mt-2 text-muted">Add a title, write your questions, and mark the right answer for each.</p>

        <section className="mt-10 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div className="space-y-5">
            <label className="block text-sm">
              Title
              <input className="input mt-2 h-12 text-base" placeholder="e.g. HTTP, properly" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block text-sm">
              Description
              <textarea className="input mt-2 min-h-28 resize-none py-3 text-base" placeholder="What is this quiz about?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                Category
                <select className="input mt-2 h-12 text-base" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <div className="text-sm">
                Visibility
                <div className="mt-2 inline-flex w-full rounded-lg border border-line bg-paper p-1">
                  <button type="button" aria-pressed={isPublic} onClick={() => setIsPublic(true)} className={`flex-1 ${seg(isPublic)}`}>Public</button>
                  <button type="button" aria-pressed={!isPublic} onClick={() => setIsPublic(false)} className={`flex-1 ${seg(!isPublic)}`}>Private</button>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted">{isPublic ? "Anyone can find this quiz in Explore." : "Only you can see and host this quiz."}</p>
          </div>
        </section>

        <h2 className="mt-14 text-2xl tracking-[-0.02em]">
          Questions <span className="font-sans text-base text-muted">{qs.length}</span>
        </h2>

        <ol className="mt-5 space-y-5">
          {qs.map((q, n) => (
            <li key={q.id} className="rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl">Question {n + 1}</span>
                {qs.length > 1 && (
                  <button type="button" onClick={() => setQs(qs.filter((x) => x.id !== q.id))} className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-red-700">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>

              <input className="input mt-4 h-12 text-base" placeholder="Write your question" aria-label={`Question ${n + 1} text`} value={q.text} onChange={(e) => patch(q.id, { text: e.target.value })} />

              <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
                <legend className="sr-only">Answer options for question {n + 1}. Select the correct one.</legend>
                {q.options.map((o, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-xl border px-3 transition ${q.correct === i ? "border-ink bg-paper" : "border-line"}`}>
                    <span className="w-4 font-serif text-muted" aria-hidden>{"ABCD"[i]}</span>
                    <input className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted" placeholder={`Option ${"ABCD"[i]}`} aria-label={`Option ${"ABCD"[i]}`} value={o} onChange={(e) => setOpt(q, i, e.target.value)} />
                    <label className="relative flex shrink-0 cursor-pointer items-center" title="Mark as correct answer">
                      <input type="radio" name={`correct-${q.id}`} checked={q.correct === i} onChange={() => patch(q.id, { correct: i })} className="peer sr-only" aria-label={`Mark option ${"ABCD"[i]} as correct`} />
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-transparent transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    </label>
                  </div>
                ))}
              </fieldset>
              <p className="mt-2 text-xs text-muted">Click the circle beside the correct answer.</p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                <span className="mr-1 text-muted">Time to answer</span>
                {[10, 20, 30, 60].map((t) => (
                  <button key={t} type="button" aria-pressed={q.time === t} onClick={() => patch(q.id, { time: t })}
                    className={`rounded-full border px-3.5 py-1.5 transition ${q.time === t ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink hover:text-ink"}`}>
                    {t}s
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <button type="button" onClick={() => { setQs([...qs, blank(next)]); setNext(next + 1); }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-6 text-muted transition hover:border-ink hover:text-ink">
          <Plus size={18} /> Add another question
        </button>
      </div>

      <div className="sticky bottom-0 z-20 mt-14 border-t border-line bg-paper">
        <div className="wrap flex max-w-3xl flex-wrap items-center justify-between gap-3 py-4">
          <div className="text-sm">
            <p className="text-muted">{done} of {qs.length} questions complete</p>
            {msg && <p role="alert" className="mt-0.5 text-red-700">{msg}</p>}
          </div>
          <button onClick={save} disabled={saving} className="btn-primary h-11 px-6 disabled:opacity-60">
            {saving ? "Saving..." : "Save quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
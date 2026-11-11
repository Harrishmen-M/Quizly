"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { categories } from "@/lib/mock";
import { useRouter } from "next/navigation";
import { createQuiz } from "@/app/actions";

type Q = {
  id: number;
  text: string;
  options: string[];
  correct: number;
  time: number;
};
const blank = (id: number): Q => ({
  id,
  text: "",
  options: ["", "", "", ""],
  correct: 0,
  time: 20,
});

export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [qs, setQs] = useState<Q[]>([blank(1)]);
  const [next, setNext] = useState(2);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const patch = (id: number, p: Partial<Q>) =>
    setQs(qs.map((q) => (q.id === id ? { ...q, ...p } : q)));
  const setOpt = (q: Q, i: number, v: string) =>
    patch(q.id, { options: q.options.map((o, j) => (j === i ? v : o)) });

  async function save() {
    if (!title.trim())
      return setMsg({ ok: false, text: "Give the quiz a title." });
    const bad = qs.findIndex(
      (q) => !q.text.trim() || q.options.some((o) => !o.trim()),
    );
    if (bad >= 0)
      return setMsg({
        ok: false,
        text: `Question ${bad + 1} needs text and all four options.`,
      });

    setMsg(null);
    setSaving(true);
    const res = await createQuiz({
      title,
      description,
      category,
      isPublic,
      questions: qs.map(({ text, options, correct, time }) => ({
        text,
        options,
        correct,
        time,
      })),
    });
    setSaving(false);
    if ("error" in res) return setMsg({ ok: false, text: res.error });
    router.push("/profile");
  }

  return (
    <div className="wrap max-w-3xl pt-14">
      <h1 className="text-4xl sm:text-5xl">Create a quiz</h1>
      <div className="mt-8 space-y-4">
        <label className="block text-sm">
          Title
          <input
            className="input mt-1.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Description
          <textarea
            className="input mt-1.5 h-24 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Category
            <select
              className="input mt-1.5"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Visibility
            <select
              className="input mt-1.5"
              value={isPublic ? "public" : "private"}
              onChange={(e) => setIsPublic(e.target.value === "public")}
            >
              <option value="public">Public, listed in Explore</option>
              <option value="private">Private, host only</option>
            </select>
          </label>
        </div>
      </div>

      <h2 className="mt-12 text-2xl">Questions</h2>
      <ol className="mt-3 border-t border-line">
        {qs.map((q, n) => (
          <li key={q.id} className="border-b border-line py-6">
            <div className="flex items-start gap-3">
              <span className="mt-2 w-6 font-serif text-muted">{n + 1}</span>
              <div className="flex-1 space-y-3">
                <input
                  className="input"
                  placeholder="Question text"
                  aria-label={`Question ${n + 1}`}
                  value={q.text}
                  onChange={(e) => patch(q.id, { text: e.target.value })}
                />
                <fieldset className="grid gap-2 sm:grid-cols-2">
                  <legend className="sr-only">
                    Options for question {n + 1}. Select the correct one.
                  </legend>
                  {q.options.map((o, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-2 rounded-lg border bg-white px-3 ${q.correct === i ? "border-ink" : "border-line"}`}
                    >
                      <input
                        type="radio"
                        name={`c${q.id}`}
                        checked={q.correct === i}
                        onChange={() => patch(q.id, { correct: i })}
                        className="accent-[#2447D6]"
                        aria-label={`Mark option ${i + 1} correct`}
                      />
                      <input
                        className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted"
                        placeholder={`Option ${i + 1}`}
                        value={o}
                        onChange={(e) => setOpt(q, i, e.target.value)}
                      />
                    </label>
                  ))}
                </fieldset>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted">
                    Time limit
                    <select
                      className="input h-9 w-24"
                      value={q.time}
                      onChange={(e) =>
                        patch(q.id, { time: Number(e.target.value) })
                      }
                    >
                      {[10, 20, 30, 60].map((t) => (
                        <option key={t} value={t}>
                          {t} sec
                        </option>
                      ))}
                    </select>
                  </label>
                  {qs.length > 1 && (
                    <button
                      onClick={() => setQs(qs.filter((x) => x.id !== q.id))}
                      className="inline-flex items-center gap-1.5 text-muted hover:text-ink"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <button
        onClick={() => {
          setQs([...qs, blank(next)]);
          setNext(next + 1);
        }}
        className="btn-ghost mt-5"
      >
        <Plus size={16} /> Add question
      </button>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save quiz"}
        </button>
        {msg && (
          <p
            role={msg.ok ? "status" : "alert"}
            className={`text-sm ${msg.ok ? "text-muted" : "text-red-700"}`}
          >
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}

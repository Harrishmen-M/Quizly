"use client";
import { useState, useTransition } from "react";
import { updateName } from "@/app/actions";

export default function EditName({ name }: { name: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await updateName(value);
      if ("error" in res) return setErr(res.error);
      setErr("");
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-4xl sm:text-5xl">{name}</h1>
        <button onClick={() => { setValue(name); setEditing(true); }} className="text-sm text-muted underline underline-offset-4 hover:text-ink">Edit name</button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input value={value} onChange={(e) => setValue(e.target.value)} maxLength={30} aria-label="Display name" className="input max-w-xs" />
        <button onClick={save} disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "Saving..." : "Save"}</button>
        <button onClick={() => setEditing(false)} className="btn-ghost">Cancel</button>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
    </div>
  );
}
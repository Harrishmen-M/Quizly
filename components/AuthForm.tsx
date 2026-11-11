"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email"));
    const password = String(f.get("password"));

    if (!isLogin && name.length < 2)
      return setError("Enter the name other players will see.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setError("Enter a valid email address.");
    if (password.length < 8)
      return setError("Use a password of at least 8 characters.");

    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
    setLoading(false);

    if (error) return setError(error.message);
    router.push("/explore");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-16 sm:pt-24">
      <h1 className="text-4xl">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-muted">
        {isLogin
          ? "Log in to host and manage your quizzes."
          : "Free for students and teachers."}
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        {!isLogin && (
          <label className="block text-sm">
            Display name
            <input name="name" className="input mt-1.5" autoComplete="name" />
          </label>
        )}
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            className="input mt-1.5"
            autoComplete="email"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            className="input mt-1.5"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="btn-primary w-full disabled:opacity-60"
        >
          {loading ? "One moment..." : isLogin ? "Log in" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link
          className="text-ink underline underline-offset-4"
          href={isLogin ? "/register" : "/login"}
        >
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  );
}

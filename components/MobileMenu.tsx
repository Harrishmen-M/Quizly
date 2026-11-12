
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { logout } from "@/app/actions";
import { UserRound } from "lucide-react";

export default function MobileMenu({
  signedIn,
}: {
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Explore", href: "/explore" },
    { label: "Create", href: "/create" },
    { label: "Join", href: "/join" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-line transition-colors hover:bg-ink/5"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-line bg-paper p-2 shadow-xl">
            <div className="px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                Navigation
              </p>
            </div>

            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-ink/5"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 border-t border-line" />

            {signedIn ? (
              <form action={logout}>
                <button className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink">
                  Log out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-ink/5"
              >
                Log in
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

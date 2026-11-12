"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { logout } from "@/app/actions";

const links = [
  { label: "Explore", href: "/explore" },
  { label: "Create", href: "/create" },
  { label: "Join", href: "/join" },
];

export default function MobileMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
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
        <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-line bg-paper p-2 shadow-xl">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-ink/5"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-2 border-t border-line" />

          {signedIn ? (
            <>
              <Link
                href="/profile"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-ink/5"
              >
                Profile
              </Link>
              <form action={logout}>
                <button className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink">
                  Log out
                </button>
              </form>
            </>
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
      )}
    </div>
  );
}

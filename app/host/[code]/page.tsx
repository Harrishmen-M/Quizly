import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import HostRoom from "@/components/HostRoom";
import { createClient } from "@/lib/supabase/server";

async function Room({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("id, status, host_id, quizzes(title)")
    .eq("code", code)
    .maybeSingle();
  if (!session || session.host_id !== data.claims.sub) notFound();

  const { data: players } = await supabase
    .from("session_players")
    .select("id, nickname")
    .eq("session_id", session.id)
    .order("nickname");

  const title = (session.quizzes as unknown as { title: string } | null)?.title ?? "Your quiz";
  return <HostRoom sessionId={session.id} code={code} title={title} initialPlayers={players ?? []} />;
}

function RoomSkeleton() {
  return (
    <div aria-hidden className="grid animate-pulse gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="h-96 rounded-2xl bg-ink/5" />
      <div className="h-96 rounded-2xl bg-ink/5" />
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8">
      <Suspense fallback={<RoomSkeleton />}>
        <Room params={params} />
      </Suspense>
    </div>
  );
}
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const title = (session.quizzes as any)?.title ?? "Your quiz";
  return (
    <HostRoom
      sessionId={session.id}
      code={code}
      title={title}
      initialPlayers={players ?? []}
    />
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <div className="wrap pt-14">
      <Suspense fallback={<p className="text-muted">Opening room...</p>}>
        <Room params={params} />
      </Suspense>
    </div>
  );
}

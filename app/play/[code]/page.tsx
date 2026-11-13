import { Suspense } from "react";
import PlayRoom from "@/components/PlayRoom";

async function Room({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PlayRoom code={code} />;
}

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <div className="mx-auto w-full max-w-xl px-5 pt-8 pb-12 sm:pt-14">
      <Suspense fallback={<p className="text-muted">Loading...</p>}>
        <Room params={params} />
      </Suspense>
    </div>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ShareHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const text = params.get("text") || "";
    const url = params.get("url") || "";
    const title = params.get("title") || "";
    const message = [text, title, url].filter(Boolean).join(" ");
    const encoded = encodeURIComponent(message.slice(0, 500));
    router.replace(`/chat?message=${encoded}`);
  }, [params, router]);

  return (
    <div className="min-h-screen bg-[#06060A] flex items-center justify-center">
      <div className="text-center">
        <div className="dots mb-4">
          <span /><span /><span />
        </div>
        <p className="text-gray-400 text-sm">Opening in Co-Patner…</p>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense>
      <ShareHandler />
    </Suspense>
  );
}

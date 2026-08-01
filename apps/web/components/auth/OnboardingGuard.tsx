"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("co_patner_token");
      const stored = localStorage.getItem("co_patner_user");
      if (!token || !stored) return;
      if (localStorage.getItem("co_patner_onboarded") === "1") return;
      const u = JSON.parse(stored);
      const needsOnboarding =
        !u.name ||
        u.name === "User" ||
        !u.avatar ||
        u.avatar === "/default-avatar.png";
      if (needsOnboarding) router.replace("/setup-profile");
    } catch {}
  }, [router]);

  return <>{children}</>;
}

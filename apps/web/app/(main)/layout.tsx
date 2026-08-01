import PushManager from "@/components/PWA/PushManager";
import OnboardingGuard from "@/components/auth/OnboardingGuard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PushManager />
      <OnboardingGuard>{children}</OnboardingGuard>
    </>
  );
}

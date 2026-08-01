import PushManager from "@/components/PWA/PushManager";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PushManager />
      {children}
    </>
  );
}

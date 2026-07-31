import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import RegisterSW from "@/components/PWA/RegisterSW";
import { AuthProvider } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Co-Patner - Live Random Video Chat with Strangers",
  description: "Connect face-to-face with people worldwide. Free, safe, anonymous video chat. Meet real people from 180+ countries instantly.",
  keywords: ["video chat", "random chat", "meet strangers", "live video chat", "random video call", "online chat"],
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Co-Patner",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Co-Patner - Live Random Video Chat",
    description: "Meet real people face to face. Free, safe, anonymous video chat.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06060A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#06060A] text-gray-200 antialiased noise">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
        <RegisterSW />
      </body>
    </html>
  );
}

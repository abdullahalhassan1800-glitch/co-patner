import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Co-Patner - Live Random Video Chat with Strangers",
  description: "Connect face-to-face with people worldwide. Free, safe, anonymous video chat. Meet real people from 180+ countries instantly.",
  keywords: ["video chat", "random chat", "meet strangers", "live video chat", "random video call", "online chat"],
  openGraph: {
    title: "Co-Patner - Live Random Video Chat",
    description: "Meet real people face to face. Free, safe, anonymous video chat.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#06060A] text-gray-200 antialiased noise">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

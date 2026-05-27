import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { Toaster } from "@/components/ui/sonner";
import { PageTransition } from "@/components/providers/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InfiAP HRMS - SuperAdmin",
  description: "SuperAdmin control panel for InfiAP HRMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full">
        <AuthProvider>
          <ToastProvider>
            <PageTransition>{children}</PageTransition>
            <Toaster position="top-right" richColors closeButton />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

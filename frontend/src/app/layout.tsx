import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NepaliQuill - Nepali Text Enhancement",
  description: "Enhance your Nepali text with AI-powered suggestions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Header />
              <main>
                {children}
              </main>
            </div>
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

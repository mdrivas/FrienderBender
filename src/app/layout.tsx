import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/toaster";
import { NavigationBar } from "./components/NavigationBar";
import { AuthProvider } from "./components/AuthProvider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "FrienderBender",
  description: "Find new friends. Go on mystery adventures. Your next connection starts in a FrienderBender.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-cream to-pink-50">
        <AuthProvider>
          <Toaster />
          <TRPCReactProvider>
            <Suspense>
              <NavigationBar />
              <main className="min-h-[calc(100vh-4rem)]">
                {children}
              </main>
            </Suspense>
          </TRPCReactProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

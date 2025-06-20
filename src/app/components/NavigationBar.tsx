"use client";

import Link from "next/link";
import { signOut, useSession, signIn } from "next-auth/react"; // Assuming you're using NextAuth for authentication
import { Button } from "~/components/ui/button";

export function NavigationBar() {
  const { status } = useSession();

  return (
    <nav className="flex items-center justify-between p-4 shadow-md bg-gradient-to-b from-[#974cd9] to-[#2e026d] text-white">
      <Link href="/">
        <Button variant="ghost" className="text-lg font-bold">
          Home
        </Button>
      </Link>
      <div className="space-x-4">
        {status === "authenticated" ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Button variant="ghost" onClick={() => signOut()}>
              Logout
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={() => signIn()}>
            Login
          </Button>
        )}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession, signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Sparkles, Home, Users, Calendar, LogIn, LogOut } from "lucide-react";
import { getUserAvatar } from "~/lib/avatar";

const FALLBACK_AVATAR = "/default-avatar.svg";

export function NavigationBar() {
  const { status, data: session } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Quiz", path: "/quiz", icon: Sparkles },
    { name: "Matches", path: "/matches", icon: Users },
    { name: "Events", path: "/events", icon: Calendar },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 gradient-coral-blue rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-charcoal">
              Friender<span className="text-coral">Bender</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? "bg-coral text-white"
                      : "text-charcoal hover:bg-soft-pink"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}

            {/* Auth buttons */}
            {status === "authenticated" ? (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/profile"
                  className={`p-2 rounded-full border-2 transition-all ${
                    pathname === "/profile"
                      ? "border-coral"
                      : "border-transparent hover:border-coral"
                  }`}
                >
                  <img
                    src={getUserAvatar(session?.user?.image)}
                    alt="Profile"
                    className="w-8 h-8 rounded-full bg-soft-pink"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_AVATAR;
                    }}
                  />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-coral"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => signIn()}
                className="ml-2 bg-coral hover:bg-coral/90 text-white rounded-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {navLinks.slice(0, 3).map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`p-2 rounded-full ${
                    isActive ? "bg-coral text-white" : "text-charcoal"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}

            {status === "authenticated" ? (
              <Link
                href="/profile"
                className={`p-1 rounded-full border-2 ${
                  pathname === "/profile"
                    ? "border-coral"
                    : "border-transparent"
                }`}
              >
                <img
                  src={getUserAvatar(session?.user?.image)}
                  alt="Profile"
                  className="w-6 h-6 rounded-full bg-soft-pink"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
              </Link>
            ) : (
              <button
                onClick={() => signIn()}
                className="p-2 rounded-full text-coral"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

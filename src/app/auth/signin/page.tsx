"use client";

import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function SignIn() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full bg-white">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-charcoal">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-charcoal/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=3432&auto=format&fit=crop"
          alt="Friends hanging out"
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute bottom-0 left-0 z-20 p-12 text-white">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-8 w-1 bg-coral rounded-full" />
            <h2 className="text-4xl font-bold tracking-tight">New City, New Friends</h2>
          </div>
          <p className="text-xl text-gray-200 max-w-md font-light leading-relaxed">
            Just graduated? Moved somewhere new? Meet people who get your vibe and explore your city together.
          </p>
        </div>
      </div>

      {/* Right Side - UI */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12 bg-cream/30">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coral/10 text-coral mb-6 transform rotate-3 hover:rotate-6 transition-transform">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">
              Welcome!
            </h1>
            <p className="mt-3 text-gray-500 text-lg">
              Sign in to take the quiz and find your matches.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <Button
              size="lg"
              className="w-full h-14 text-base font-medium relative overflow-hidden bg-white text-charcoal border-2 border-gray-200 hover:bg-gray-50 hover:border-coral hover:text-coral shadow-sm transition-all duration-300 group rounded-xl"
              onClick={() => signIn("google", { callbackUrl: "/quiz" })}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5 mr-3"
              />
              Sign in with Google
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400 font-medium tracking-wider">
                  Trusted by friends everywhere
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 leading-relaxed px-4">
              By signing in, you agree to our Terms of Service and Privacy Policy. We never post to your social media.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


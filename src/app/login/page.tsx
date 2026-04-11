"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { Sparkles, Wand2, Zap, PenLine } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden noise-bg">
      {/* Animated orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
      <div className="absolute top-[30%] right-[20%] w-[200px] h-[200px] rounded-full bg-chart-2/10 blur-[80px] animate-glow-pulse [animation-delay:0.8s]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10 animate-float">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/20 mb-6 shadow-xl shadow-primary/10">
            <Sparkles className="h-9 w-9 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            Draftly
          </h1>
          <p className="text-muted-foreground mt-3 text-base">
            AI-powered writing, elevated.
          </p>
        </div>

        {/* Glass card */}
        <div className="rounded-3xl border border-white/[0.08] bg-card/50 backdrop-blur-2xl p-8 shadow-2xl shadow-black/20">
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { icon: Wand2, label: "AI Refactor" },
              { icon: PenLine, label: "Microblog" },
              { icon: Zap, label: "Premium" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] text-foreground/70 text-[11px] font-medium border border-white/[0.06] backdrop-blur-sm"
              >
                <Icon className="h-3 w-3 text-primary" /> {label}
              </span>
            ))}
          </div>

          <Button
            className="w-full h-12 text-sm font-semibold gap-3 rounded-2xl bg-white text-black hover:bg-white/90 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
            Start writing AI-enhanced posts in seconds
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
}

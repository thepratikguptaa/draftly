"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Crown, LogOut, Sparkles, ArrowUpRight } from "lucide-react";

export function Header({ onUpgrade }: { onUpgrade: () => void }) {
  const { data: session } = useSession();
  if (!session) return null;

  const isPremium = (session.user as any).isPremium;

  return (
    <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl">
      {/* Gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center border border-primary/15 shadow-sm shadow-primary/10">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">Draftly</span>
          {isPremium && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-400 border border-amber-500/15 animate-shimmer"
              style={{ backgroundImage: "linear-gradient(90deg, rgba(245,158,11,0.15) 0%, rgba(249,115,22,0.25) 50%, rgba(245,158,11,0.15) 100%)" }}
            >
              <Crown className="h-2.5 w-2.5" />
              Pro
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!isPremium && (
            <Button
              size="sm"
              onClick={onUpgrade}
              className="gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 border-0 transition-all duration-200 hover:shadow-xl hover:shadow-violet-600/30 hover:scale-[1.03] active:scale-[0.97]"
            >
              <Crown className="h-3.5 w-3.5" />
              Upgrade
              <ArrowUpRight className="h-3 w-3 opacity-70" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none transition-all hover:scale-105">
              <div className="p-0.5 rounded-full bg-gradient-to-br from-primary/40 to-transparent">
                <Avatar className="h-9 w-9 border-2 border-background">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {session.user.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 border-white/[0.08] bg-card/90 backdrop-blur-xl shadow-2xl">
              <div className="px-3 py-2.5 mb-1">
                <p className="text-sm font-semibold">{session.user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{session.user.email}</p>
              </div>
              <div className="h-px bg-border/50 my-1" />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="gap-2.5 text-red-400 rounded-xl cursor-pointer hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

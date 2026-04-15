"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { ComposePost } from "@/components/compose-post";
import { Feed } from "@/components/feed";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Loader2, Search, Sparkles, X } from "lucide-react";
import { Skeleton } from "boneyard-js/react";
import { toast } from "sonner";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const isPremium = (session?.user as any)?.isPremium;

  async function handleUpgrade() {
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to create order"); return; }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Draftly",
        description: "Premium Upgrade",
        order_id: data.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            toast.success("Upgraded to Premium!");
            window.location.reload();
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: { color: "#7c3aed" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch { toast.error("Something went wrong"); }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen noise-bg">
        {/* Header skeleton */}
        <div className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-between">
            <Skeleton name="header-logo" loading={true}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-muted" />
                <div className="h-5 w-20 rounded bg-muted" />
              </div>
            </Skeleton>
            <Skeleton name="header-actions" loading={true}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted" />
              </div>
            </Skeleton>
          </div>
        </div>
        {/* Body skeleton */}
        <div className="w-full px-6 lg:px-10 py-8">
          <div className="flex gap-8 items-start">
            <div className="hidden lg:flex flex-col gap-5 w-[450px] flex-shrink-0">
              <Skeleton name="profile-card" loading={true}>
                <div className="rounded-2xl border border-white/[0.06] bg-card/50 p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-28 rounded bg-muted" />
                      <div className="h-3 w-40 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </Skeleton>
              <Skeleton name="compose-skeleton" loading={true}>
                <div className="rounded-[20px] border border-white/[0.06] bg-card/70 p-6 space-y-4">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-[120px] w-full rounded-2xl bg-muted/50" />
                  <div className="h-1 w-full rounded bg-muted/30" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-9 w-[150px] rounded-xl bg-muted/50" />
                    <div className="h-9 w-20 rounded-xl bg-muted/50" />
                    <div className="flex-1" />
                    <div className="h-9 w-20 rounded-xl bg-muted/50" />
                  </div>
                </div>
              </Skeleton>
            </div>
            <div className="flex-1 min-w-0 space-y-6">
              <Skeleton name="search-skeleton" loading={true}>
                <div className="h-10 w-full rounded-xl bg-muted/50" />
              </Skeleton>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} name={`page-post-${i}`} loading={true}>
                    <div className="rounded-2xl border border-white/[0.05] bg-card/40 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-muted" />
                        <div className="h-3.5 w-28 rounded bg-muted" />
                        <div className="flex-1" />
                        <div className="h-3 w-8 rounded bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3.5 w-full rounded bg-muted" />
                        <div className="h-3.5 w-3/4 rounded bg-muted" />
                      </div>
                      <div className="flex gap-4 mt-4 pt-2">
                        <div className="h-4 w-10 rounded bg-muted" />
                        <div className="h-4 w-16 rounded bg-muted" />
                      </div>
                    </div>
                  </Skeleton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen relative noise-bg">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary/[0.07] blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-chart-2/[0.05] blur-[120px] animate-glow-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header onUpgrade={handleUpgrade} />

        <main className="flex-1 w-full px-6 lg:px-10 py-8">
          {/* Two-column layout: sidebar + feed */}
          <div className="flex gap-8 items-start">
            {/* Left sidebar - sticky */}
            <aside className="hidden lg:flex flex-col gap-5 w-[500px] flex-shrink-0 sticky top-24">
              {/* Profile card */}
              <div className="rounded-2xl border border-white/[0.06] bg-card/50 backdrop-blur-xl p-5">
                <div className="flex items-center gap-3.5">
                  <div className={`flex-shrink-0 rounded-full ${isPremium ? "p-0.5 bg-gradient-to-br from-amber-400/50 to-orange-500/50" : ""}`}>
                    <Avatar className={`h-11 w-11 ${isPremium ? "border-2 border-background" : "border border-white/[0.08]"}`}>
                      <AvatarImage src={session.user.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {session.user.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm truncate">{session.user.name}</span>
                      {isPremium && <Crown className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground/60 truncate">{session.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Compose box */}
              <ComposePost onPostCreated={() => setRefreshKey((k) => k + 1)} />

            </aside>

            {/* Right column - feed */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Mobile compose (hidden on desktop) */}
              <div className="lg:hidden">
                <ComposePost onPostCreated={() => setRefreshKey((k) => k + 1)} />
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSearchQuery(searchInput);
                  }}
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm outline-none focus:border-primary/30 placeholder:text-muted-foreground/30 transition-colors"
                />
                {searchInput && (
                  <button
                    onClick={() => { setSearchInput(""); setSearchQuery(""); }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Feed header */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary/60" />
                </div>
                <h2 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
                  {searchQuery ? `Results for "${searchQuery}"` : "Latest Posts"}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
              </div>

              <Feed refreshKey={refreshKey} searchQuery={searchQuery} />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

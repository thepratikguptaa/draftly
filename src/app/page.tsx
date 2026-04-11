"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { ComposePost } from "@/components/compose-post";
import { Feed } from "@/components/feed";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

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
      <div className="min-h-screen flex items-center justify-center noise-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
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

      <div className="relative z-10">
        <Header onUpgrade={handleUpgrade} />

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          <ComposePost onPostCreated={() => setRefreshKey((k) => k + 1)} />

          {/* Feed section header */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary/60" />
            </div>
            <h2 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
              Latest Posts
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
          </div>

          <Feed refreshKey={refreshKey} />
        </main>
      </div>
    </div>
  );
}

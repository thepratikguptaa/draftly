"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Loader2 } from "lucide-react";

interface FeedPost {
  _id: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  user: { name: string; image: string; isPremium: boolean };
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function Feed({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const res = await fetch("/api/post");
        if (res.ok) setPosts(await res.json());
      } catch { console.error("Failed to load posts"); }
      finally { setLoading(false); }
    }
    loadPosts();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
          <span className="text-xs text-muted-foreground/50">Loading posts...</span>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-4">
          <span className="text-2xl">✍️</span>
        </div>
        <p className="text-sm text-muted-foreground">No posts yet</p>
        <p className="text-xs text-muted-foreground/50 mt-1">Be the first to write something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post, i) => (
        <article
          key={post._id}
          className="group relative rounded-2xl border border-white/[0.05] bg-card/40 backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/[0.1] hover:bg-card/60 hover:shadow-xl hover:shadow-primary/[0.04] hover:-translate-y-0.5"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-start gap-4">
            {/* Avatar with gradient ring for premium */}
            <div className={`flex-shrink-0 rounded-full ${post.user.isPremium ? "p-0.5 bg-gradient-to-br from-amber-400/50 to-orange-500/50" : ""}`}>
              <Avatar className={`h-10 w-10 ${post.user.isPremium ? "border-2 border-background" : "border border-white/[0.08]"}`}>
                <AvatarImage src={post.user.image} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {post.user.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              {/* Name row */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-semibold text-sm text-foreground/90 truncate">
                  {post.user.name}
                </span>
                {post.user.isPremium && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400">
                    <Crown className="h-2.5 w-2.5" /> Pro
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground/40 ml-auto flex-shrink-0 font-medium">
                  {timeAgo(post.createdAt)}
                </span>
              </div>

              {/* Post text */}
              <p className="text-[15px] leading-[1.7] whitespace-pre-wrap break-words text-foreground/80">
                {post.text}
              </p>

              {/* Image */}
              {post.imageUrl && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-white/[0.06]">
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="w-full object-contain bg-black/20"
                  />
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

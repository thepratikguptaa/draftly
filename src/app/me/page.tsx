"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/footer";
import { Skeleton } from "boneyard-js/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Crown,
  Loader2,
  Pencil,
  Trash2,
  X,
  Check,
  Sparkles,
} from "lucide-react";

interface MyPost {
  _id: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function MePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isPremium = (session?.user as any)?.isPremium;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") loadPosts();
  }, [status]);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/post/me");
      if (res.ok) setPosts(await res.json());
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/post/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
        toast.success("Post deleted");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(post: MyPost) {
    setEditingId(post._id);
    setEditText(post.text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function handleSaveEdit(id: string) {
    if (!editText.trim()) {
      toast.error("Post cannot be empty");
      return;
    }
    setSavingId(id);
    try {
      const res = await fetch(`/api/post/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, text: editText } : p))
        );
        setEditingId(null);
        setEditText("");
        toast.success("Post updated");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      setSavingId(null);
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen noise-bg">
        <div className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
            <Skeleton name="me-back" loading={true}>
              <div className="h-8 w-16 rounded-xl bg-muted" />
            </Skeleton>
            <div className="h-5 w-px bg-border/50" />
            <Skeleton name="me-title" loading={true}>
              <div className="h-4 w-20 rounded bg-muted" />
            </Skeleton>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8 w-full">
          <Skeleton name="me-profile" loading={true}>
            <div className="rounded-2xl border border-white/[0.06] bg-card/50 p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded bg-muted" />
                  <div className="h-3 w-48 rounded bg-muted" />
                  <div className="h-2.5 w-16 rounded bg-muted" />
                </div>
              </div>
            </div>
          </Skeleton>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} name={`me-post-${i}`} loading={true}>
                <div className="rounded-2xl border border-white/[0.05] bg-card/40 p-5">
                  <div className="space-y-2">
                    <div className="h-3.5 w-full rounded bg-muted" />
                    <div className="h-3.5 w-2/3 rounded bg-muted" />
                  </div>
                  <div className="h-2.5 w-14 rounded bg-muted mt-3" />
                </div>
              </Skeleton>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative noise-bg">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary/[0.07] blur-[150px] animate-glow-pulse" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2 rounded-xl hover:bg-white/[0.06] text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-5 w-px bg-border/50" />
            <h1 className="text-sm font-bold tracking-tight">My Posts</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 w-full flex-1">
          {/* Profile card */}
          <div className="rounded-2xl border border-white/[0.06] bg-card/50 backdrop-blur-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex-shrink-0 rounded-full ${isPremium ? "p-0.5 bg-gradient-to-br from-amber-400/50 to-orange-500/50" : ""}`}>
                <Avatar className={`h-14 w-14 ${isPremium ? "border-2 border-background" : "border border-white/[0.08]"}`}>
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {session.user.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{session.user.name}</span>
                  {isPremium && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400">
                      <Crown className="h-2.5 w-2.5" /> Pro
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  {posts.length} post{posts.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} name={`me-loading-post-${i}`} loading={true}>
                  <div className="rounded-2xl border border-white/[0.05] bg-card/40 p-5">
                    <div className="space-y-2">
                      <div className="h-3.5 w-full rounded bg-muted" />
                      <div className="h-3.5 w-2/3 rounded bg-muted" />
                    </div>
                    <div className="h-2.5 w-14 rounded bg-muted mt-3" />
                  </div>
                </Skeleton>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-4">
                <Sparkles className="h-6 w-6 text-primary/40" />
              </div>
              <p className="text-sm text-muted-foreground">You haven&apos;t posted anything yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
                className="mt-4 rounded-xl border-white/[0.06]"
              >
                Write your first post
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="group rounded-2xl border border-white/[0.05] bg-card/40 backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/[0.1] hover:bg-card/60"
                >
                  {editingId === post._id ? (
                    /* Edit mode */
                    <div className="space-y-3">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={280}
                        className="min-h-[80px] resize-none text-[15px] bg-white/[0.03] border-white/[0.06] rounded-xl focus:border-primary/30"
                      />
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-medium tabular-nums ${
                          editText.length > 250 ? "text-red-400" : "text-muted-foreground/50"
                        }`}>
                          {editText.length}/280
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEdit}
                            className="gap-1.5 rounded-xl text-xs hover:bg-white/[0.06]"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(post._id)}
                            disabled={savingId === post._id || !editText.trim()}
                            className="gap-1.5 rounded-xl text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0"
                          >
                            {savingId === post._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] leading-[1.7] whitespace-pre-wrap break-words text-foreground/80">
                            {post.text}
                          </p>
                          {post.imageUrl && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-white/[0.06]">
                              <img src={post.imageUrl} alt="" className="w-full object-contain bg-black/20" />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(post)}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post._id)}
                            disabled={deletingId === post._id}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            {deletingId === post._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground/40 mt-3 font-medium">
                        {timeAgo(post.createdAt)}
                      </p>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

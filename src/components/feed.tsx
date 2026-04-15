"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "boneyard-js/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, MessageCircle, Send, Trash2, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { toast } from "sonner";

interface FeedPost {
  _id: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  user: { name: string; image: string; isPremium: boolean };
}

interface CommentData {
  _id: string;
  postId: string;
  text: string;
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

function PostComments({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/comment?postId=${postId}`);
        if (res.ok) setComments(await res.json());
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, [postId]);

  async function handlePost() {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, text: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to comment");
      }
    } catch { toast.error("Failed to comment"); }
    finally { setPosting(false); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/comment/${id}`, { method: "DELETE" });
      if (res.ok) setComments((prev) => prev.filter((c) => c._id !== id));
      else toast.error("Failed to delete");
    } catch { toast.error("Failed to delete"); }
    finally { setDeletingId(null); }
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-3">
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <Skeleton key={i} name={`comment-${postId}-${i}`} loading={true}>
              <div className="flex items-start gap-2.5">
                <div className="h-6 w-6 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.04] px-3 py-2 space-y-1.5">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-2.5 w-full rounded bg-muted/70" />
                </div>
              </div>
            </Skeleton>
          ))}
        </div>
      ) : (
        <>
          {comments.length > 0 && (
            <div className="space-y-2.5">
              {comments.map((comment) => (
                <div key={comment._id} className="group/comment flex items-start gap-2.5">
                  <Avatar className="h-6 w-6 border border-white/[0.08] flex-shrink-0 mt-0.5">
                    <AvatarImage src={comment.user.image} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {comment.user.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-foreground/80">{comment.user.name}</span>
                        {comment.user.isPremium && <Crown className="h-2.5 w-2.5 text-amber-400" />}
                        <span className="text-[10px] text-muted-foreground/30 ml-auto">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed break-words">{comment.text}</p>
                    </div>
                  </div>
                  {session?.user?.name === comment.user.name && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      disabled={deletingId === comment._id}
                      className="sm:opacity-0 sm:group-hover/comment:opacity-100 transition-opacity mt-1.5 p-1 rounded-md hover:bg-red-500/10 text-muted-foreground/30 hover:text-red-400"
                    >
                      {deletingId === comment._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-white/[0.08] flex-shrink-0">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                {session?.user?.name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] focus-within:border-primary/20 transition-colors px-3 py-1.5">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handlePost()}
                placeholder="Write a comment..."
                maxLength={280}
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/30 text-foreground/80"
              />
              <button
                onClick={handlePost}
                disabled={posting || !newComment.trim()}
                className="text-primary/60 hover:text-primary disabled:text-muted-foreground/20 transition-colors p-0.5"
              >
                {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Feed({ refreshKey, searchQuery }: { refreshKey: number; searchQuery?: string }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPage(1);
    setPosts([]);
    loadPosts(1, true);
  }, [refreshKey, searchQuery]);

  async function loadPosts(pageNum: number, reset = false) {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "3" });
      if (searchQuery) params.set("q", searchQuery);
      const res = await fetch(`/api/post?${params}`);
      if (res.ok) {
        const data = await res.json();
        const newPosts = data.posts || [];
        const pagination = data.pagination;
        if (reset) setPosts(newPosts);
        else setPosts((prev) => [...prev, ...newPosts]);
        setHasMore(pagination ? pagination.page < pagination.totalPages : false);
        setPage(pageNum);
      }
    } catch { console.error("Failed to load posts"); }
    finally { setLoading(false); setLoadingMore(false); }
  }

  function toggleComments(postId: string) {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  async function handleLike(postId: string) {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
            }
          : p
      )
    );

    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) {
        // Revert on failure
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  isLiked: !p.isLiked,
                  likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
                }
              : p
          )
        );
        toast.error("Failed to like");
      }
    } catch {
      toast.error("Failed to like");
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/[0.05] bg-card/40 p-5">
            <Skeleton name={`post-header-${i}`} loading={true}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-3.5 w-28 rounded bg-muted mb-1.5" />
                </div>
                <div className="h-3 w-8 rounded bg-muted" />
              </div>
            </Skeleton>
            <Skeleton name={`post-body-${i}`} loading={true}>
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded bg-muted" />
                <div className="h-3.5 w-3/4 rounded bg-muted" />
                <div className="h-3.5 w-1/2 rounded bg-muted" />
              </div>
            </Skeleton>
            <Skeleton name={`post-actions-${i}`} loading={true}>
              <div className="flex gap-4 mt-4 pt-2">
                <div className="h-4 w-10 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            </Skeleton>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-4">
          <span className="text-2xl">{searchQuery ? "🔍" : "✍️"}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {searchQuery ? `No posts found for "${searchQuery}"` : "No posts yet"}
        </p>
        {!searchQuery && (
          <p className="text-xs text-muted-foreground/50 mt-1">Be the first to write something!</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const isExpanded = expandedPosts.has(post._id);

        return (
          <article
            key={post._id}
            className="group rounded-2xl border border-white/[0.05] bg-card/40 backdrop-blur-sm p-5 transition-all duration-300 hover:border-white/[0.1] hover:bg-card/60"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex-shrink-0 rounded-full ${post.user.isPremium ? "p-0.5 bg-gradient-to-br from-amber-400/50 to-orange-500/50" : ""}`}>
                <Avatar className={`h-8 w-8 ${post.user.isPremium ? "border-2 border-background" : "border border-white/[0.08]"}`}>
                  <AvatarImage src={post.user.image} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {post.user.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-semibold text-sm text-foreground/90 truncate">
                  {post.user.name}
                </span>
                {post.user.isPremium && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400">
                    <Crown className="h-2 w-2" /> Pro
                  </span>
                )}
              </div>

              <span className="text-[11px] text-muted-foreground/40 flex-shrink-0 font-medium">
                {timeAgo(post.createdAt)}
              </span>
            </div>

            <p className="text-[15px] leading-[1.75] whitespace-pre-wrap break-words text-foreground/80">
              {post.text}
            </p>

            {post.imageUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-white/[0.06]">
                <img src={post.imageUrl} alt="" className="w-full object-contain bg-black/20" />
              </div>
            )}

            {/* Action bar */}
            <div className="mt-3 pt-2 flex items-center gap-4">
              {/* Like */}
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center gap-1.5 text-xs transition-all duration-200 ${
                  post.isLiked
                    ? "text-rose-500"
                    : "text-muted-foreground/50 hover:text-rose-500/70"
                }`}
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-200 ${
                    post.isLiked ? "fill-rose-500 scale-110" : "hover:scale-110"
                  }`}
                />
                {post.likeCount > 0 && (
                  <span className="font-medium tabular-nums">{post.likeCount}</span>
                )}
              </button>

              {/* Comment toggle */}
              <button
                onClick={() => toggleComments(post._id)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-primary/70 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {post.commentCount > 0 && (
                  <span className="font-medium tabular-nums">{post.commentCount}</span>
                )}
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {isExpanded && <PostComments postId={post._id} />}
          </article>
        );
      })}

      {/* Load More skeleton */}
      {loadingMore && (
        <div className="space-y-3 pt-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/[0.05] bg-card/40 p-5">
              <Skeleton name={`load-more-${page}-${i}`} loading={true}>
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
              </Skeleton>
            </div>
          ))}
        </div>
      )}

      {/* Load More button */}
      {hasMore && !loadingMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => loadPosts(page + 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.08] hover:border-white/[0.1] transition-all"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Wand2, ImagePlus, Loader2, X, Lock, Send, Sparkles } from "lucide-react";

const STYLES = [
  { value: "basic", label: "Basic", premium: false },
  { value: "professional", label: "Professional", premium: true },
  { value: "casual", label: "Casual", premium: true },
  { value: "funny", label: "Funny", premium: true },
  { value: "concise", label: "Concise", premium: true },
];

interface ComposePostProps {
  onPostCreated: () => void;
}

export function ComposePost({ onPostCreated }: ComposePostProps) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [style, setStyle] = useState("basic");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPremium = (session?.user as any)?.isPremium;
  const charPercent = (text.length / 280) * 100;

  async function handleRefactor() {
    if (!text.trim()) { toast.error("Write something first!"); return; }
    setIsRefactoring(true);
    try {
      const res = await fetch("/api/refactor", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setText(data.refactoredText);
      toast.success("Text refactored!");
    } catch { toast.error("Refactor failed"); }
    finally { setIsRefactoring(false); }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setImageUrl(data.url);
      setImagePreview(URL.createObjectURL(file));
      toast.success("Image uploaded!");
    } catch { toast.error("Upload failed"); }
    finally { setIsUploading(false); }
  }

  async function handlePost() {
    if (!text.trim()) { toast.error("Write something first!"); return; }
    setIsPosting(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setText(""); setImageUrl(""); setImagePreview("");
      toast.success("Posted!");
      onPostCreated();
    } catch { toast.error("Failed to post"); }
    finally { setIsPosting(false); }
  }

  function removeImage() {
    setImageUrl(""); setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="relative group">
      {/* Glow border effect */}
      <div className="absolute -inset-px rounded-[20px] bg-gradient-to-b from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative rounded-[20px] border border-white/[0.06] bg-card/70 backdrop-blur-xl p-6 space-y-4 shadow-xl shadow-black/10">
        {/* Header label */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compose</span>
        </div>

        <Textarea
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={280}
          className="min-h-[120px] resize-none text-[15px] leading-relaxed bg-white/[0.03] border-white/[0.06] rounded-2xl focus:border-primary/30 focus:bg-white/[0.05] placeholder:text-muted-foreground/40 transition-all duration-200"
        />

        {/* Character counter bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                charPercent > 90 ? "bg-red-500 shadow-sm shadow-red-500/50"
                : charPercent > 70 ? "bg-amber-500 shadow-sm shadow-amber-500/50"
                : "bg-gradient-to-r from-primary/50 to-primary"
              }`}
              style={{ width: `${Math.min(charPercent, 100)}%` }}
            />
          </div>
          <span className={`text-[11px] font-semibold tabular-nums ${
            charPercent > 90 ? "text-red-400" : charPercent > 70 ? "text-amber-400" : "text-muted-foreground/60"
          }`}>
            {text.length}/280
          </span>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="relative inline-block group/img">
            <img src={imagePreview} alt="Preview" className="max-h-48 rounded-2xl border border-white/[0.06] object-contain" />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg hover:bg-red-400 hover:scale-110 transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.04]">
          <Select value={style} onValueChange={(v) => v && setStyle(v)} disabled={isRefactoring}>
            <SelectTrigger className="w-[130px] h-9 text-xs font-medium rounded-xl bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08] transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/[0.08] bg-card/95 backdrop-blur-xl">
              {STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value} disabled={s.premium && !isPremium} className="rounded-xl text-xs">
                  <span className="flex items-center gap-2">
                    {s.label}
                    {s.premium && !isPremium && <Lock className="h-3 w-3 text-muted-foreground/50" />}
                    {s.premium && (
                      <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-400">Pro</span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefactor}
            disabled={isRefactoring || !text.trim()}
            className="gap-1.5 rounded-xl border-white/[0.06] bg-white/[0.03] hover:bg-primary/10 hover:text-primary hover:border-primary/20 text-xs font-medium transition-all duration-200"
          >
            {isRefactoring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            Refactor
          </Button>

          <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleImageUpload} />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isPremium || isUploading}
            className="gap-1.5 rounded-xl hover:bg-white/[0.06] text-xs transition-all"
            title={isPremium ? "Add image" : "Premium feature"}
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {!isPremium && <Lock className="h-3 w-3 opacity-40" />}
          </Button>

          <div className="flex-1" />

          <Button
            size="sm"
            onClick={handlePost}
            disabled={isPosting || !text.trim()}
            className="gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/20 border-0 px-6 text-xs font-semibold transition-all duration-200 hover:shadow-xl hover:shadow-violet-600/25 hover:scale-[1.03] active:scale-[0.97]"
          >
            {isPosting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

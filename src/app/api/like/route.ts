import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Like } from "@/models/Like";
import { Post } from "@/models/Post";
import { likeSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 120 likes per 15 minutes
  const rl = rateLimit(`like:${session.user.id}`, 120, 15 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many likes. Slow down." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = likeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { postId } = parsed.data;

  await connectDB();

  // Verify post exists
  const post = await Post.findById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existing = await Like.findOne({ postId, userId: session.user.id });

  if (existing) {
    await Like.findByIdAndDelete(existing._id);
    return NextResponse.json({ liked: false });
  } else {
    await Like.create({ postId, userId: session.user.id });
    return NextResponse.json({ liked: true });
  }
}

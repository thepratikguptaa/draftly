import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { createCommentSchema, idParamSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 60 comments per 15 minutes
  const rl = rateLimit(`comment:${session.user.id}`, 60, 15 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many comments. Slow down." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { postId, text } = parsed.data;

  await connectDB();

  // Verify post exists
  const post = await Post.findById(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await Comment.create({
    postId,
    userId: session.user.id,
    text,
  });

  const user = await User.findById(session.user.id).lean();

  return NextResponse.json({
    _id: comment._id,
    postId: comment.postId,
    text: comment.text,
    createdAt: comment.createdAt,
    user: user
      ? { name: user.name, image: user.image, isPremium: user.isPremium }
      : { name: "Unknown", image: "", isPremium: false },
  }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId || !idParamSchema.safeParse(postId).success) {
    return NextResponse.json({ error: "Valid postId required" }, { status: 400 });
  }

  await connectDB();

  const comments = await Comment.find({ postId })
    .sort({ createdAt: 1 })
    .lean();

  const userIds = [...new Set(comments.map((c) => c.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const result = comments.map((comment) => {
    const user = userMap.get(comment.userId.toString());
    return {
      _id: comment._id,
      postId: comment.postId,
      text: comment.text,
      createdAt: comment.createdAt,
      user: user
        ? { name: user.name, image: user.image, isPremium: user.isPremium }
        : { name: "Unknown", image: "", isPremium: false },
    };
  });

  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId, text } = await req.json();

  if (!postId || !text || text.length > 280) {
    return NextResponse.json({ error: "Post ID and text required (max 280 chars)" }, { status: 400 });
  }

  await connectDB();

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
  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
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
      isOwn: false, // will be set client-side
    };
  });

  return NextResponse.json(result);
}

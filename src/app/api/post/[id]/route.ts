import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Comment } from "@/models/Comment";
import { Like } from "@/models/Like";
import { updatePostSchema, idParamSchema } from "@/lib/validations";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!idParamSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  await connectDB();

  const post = await Post.findById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete post and its comments/likes
  await Promise.all([
    Post.findByIdAndDelete(id),
    Comment.deleteMany({ postId: id }),
    Like.deleteMany({ postId: id }),
  ]);

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!idParamSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();

  const post = await Post.findById(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  post.text = parsed.data.text;
  await post.save();
  return NextResponse.json(post);
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const posts = await Post.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(posts);
}

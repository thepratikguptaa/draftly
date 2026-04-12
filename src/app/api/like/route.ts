import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Like } from "@/models/Like";

// Toggle like (like if not liked, unlike if already liked)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await req.json();
  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }

  await connectDB();

  const existing = await Like.findOne({ postId, userId: session.user.id });

  if (existing) {
    await Like.findByIdAndDelete(existing._id);
    return NextResponse.json({ liked: false });
  } else {
    await Like.create({ postId, userId: session.user.id });
    return NextResponse.json({ liked: true });
  }
}

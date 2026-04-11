import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const comment = await Comment.findById(id);
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  if (comment.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Comment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { Comment } from "@/models/Comment";
import { Like } from "@/models/Like";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, imageUrl } = await req.json();

  if (!text || text.length > 280) {
    return NextResponse.json({ error: "Text is required and must be under 280 characters" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (imageUrl && !user.isPremium) {
    return NextResponse.json({ error: "Image upload is a premium feature" }, { status: 403 });
  }

  const post = await Post.create({
    userId: session.user.id,
    text,
    imageUrl: imageUrl || "",
  });

  return NextResponse.json(post, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const query = req.nextUrl.searchParams.get("q");

  await connectDB();

  let filter = {};
  if (query) {
    filter = { text: { $regex: query, $options: "i" } };
  }

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const userIds = [...new Set(posts.map((p) => p.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const postIds = posts.map((p) => p._id);

  const commentCounts = await Comment.aggregate([
    { $match: { postId: { $in: postIds } } },
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);
  const commentMap = new Map(commentCounts.map((c) => [c._id.toString(), c.count]));

  const likeCounts = await Like.aggregate([
    { $match: { postId: { $in: postIds } } },
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ]);
  const likeMap = new Map(likeCounts.map((l) => [l._id.toString(), l.count]));

  let userLikes = new Set<string>();
  if (currentUserId) {
    const likes = await Like.find({
      postId: { $in: postIds },
      userId: currentUserId,
    }).lean();
    userLikes = new Set(likes.map((l) => l.postId.toString()));
  }

  const feed = posts.map((post) => {
    const user = userMap.get(post.userId.toString());
    return {
      _id: post._id,
      text: post.text,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      commentCount: commentMap.get(post._id.toString()) || 0,
      likeCount: likeMap.get(post._id.toString()) || 0,
      isLiked: userLikes.has(post._id.toString()),
      user: user
        ? { name: user.name, image: user.image, isPremium: user.isPremium }
        : { name: "Unknown", image: "", isPremium: false },
    };
  });

  return NextResponse.json(feed);
}

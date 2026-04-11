import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import ImageKit from "imagekit";

function getImageKit() {
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
  });
}

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user?.isPremium) {
    return NextResponse.json({ error: "Image upload is a premium feature" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only image files (JPEG, PNG, GIF, WebP) allowed" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be under 2MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const imagekit = getImageKit();
    const result = await imagekit.upload({
      file: buffer,
      fileName: `post-${Date.now()}-${file.name}`,
      folder: "/draftly/posts",
    });

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

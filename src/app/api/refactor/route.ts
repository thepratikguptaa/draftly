import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const STYLES = ["basic", "professional", "casual", "funny", "concise"] as const;
type Style = (typeof STYLES)[number];

function isNewDay(lastDate: Date): boolean {
  const now = new Date();
  return (
    now.getUTCFullYear() !== lastDate.getUTCFullYear() ||
    now.getUTCMonth() !== lastDate.getUTCMonth() ||
    now.getUTCDate() !== lastDate.getUTCDate()
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, style } = (await req.json()) as { text: string; style: Style };

  if (!text || text.length > 280) {
    return NextResponse.json({ error: "Text required (max 280 chars)" }, { status: 400 });
  }

  if (!STYLES.includes(style)) {
    return NextResponse.json({ error: "Invalid style" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Free users: only basic style, max 5/day
  if (!user.isPremium) {
    if (style !== "basic") {
      return NextResponse.json({ error: "Premium styles require an upgrade" }, { status: 403 });
    }

    if (isNewDay(user.lastRefactorDate)) {
      user.dailyRefactorCount = 0;
      user.lastRefactorDate = new Date();
    }

    if (user.dailyRefactorCount >= 5) {
      return NextResponse.json(
        { error: "Daily refactor limit reached (5/day). Upgrade for unlimited!" },
        { status: 429 }
      );
    }
  }

  const prompt = `Refactor the text based on style: ${style}

Styles:
- professional
- casual
- funny
- concise
- basic

Rules:
- Keep meaning same
- Improve clarity and engagement
- Return only improved text

Text:
${text}`;

  try {
    const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_API_KEY!,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a writing assistant. Return only the improved text, nothing else." },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Azure OpenAI error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await response.json();
    const refactoredText = data.choices?.[0]?.message?.content?.trim();

    if (!refactoredText) {
      return NextResponse.json({ error: "No response from AI" }, { status: 502 });
    }

    // Increment count for free users
    if (!user.isPremium) {
      user.dailyRefactorCount += 1;
      user.lastRefactorDate = new Date();
    }
    await user.save();

    return NextResponse.json({ refactoredText });
  } catch (error) {
    console.error("Refactor error:", error);
    return NextResponse.json({ error: "Failed to refactor" }, { status: 500 });
  }
}

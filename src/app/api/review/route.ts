import { NextResponse } from "next/server";
import { sendCommunityReviewEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const rating = Number(body.rating);
    const review = String(body.review ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!name || !review) {
      return NextResponse.json({ error: "Name and review are required" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Please choose a rating from 1 to 5" }, { status: 400 });
    }
    if (review.length > 1000) {
      return NextResponse.json({ error: "Review is too long" }, { status: 400 });
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { error } = await sendCommunityReviewEmail({
      name,
      rating,
      review,
      email: email || undefined,
    });
    if (error) {
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

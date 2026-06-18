import { supabase } from "./supabase";

// A community story as shown publicly in the "From Our Community" section.
// The submitter's email is deliberately left out of this shape - it is
// never exposed to the storefront.
export type CommunityReview = {
  id: number;
  name: string;
  rating: number;
  review: string;
  createdAt: string;
};

type CommunityReviewRow = {
  id: number;
  name: string;
  rating: number;
  review: string;
  created_at: string;
};

function rowToReview(row: CommunityReviewRow): CommunityReview {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    review: row.review,
    createdAt: row.created_at,
  };
}

// Approved community stories, newest first. Used to render the
// "From Our Community" section on the community page.
export async function getApprovedCommunityReviews(
  limit = 12
): Promise<CommunityReview[]> {
  const { data, error } = await supabase
    .from("community_reviews")
    .select("id, name, rating, review, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getApprovedCommunityReviews error:", error);
    return [];
  }
  return (data as CommunityReviewRow[]).map(rowToReview);
}

// Store a new submission from the community form. Starts unapproved -
// the owner publishes it from the admin → Community screen.
export async function insertCommunityReview(params: {
  name: string;
  rating: number;
  review: string;
  email?: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from("community_reviews").insert({
    name: params.name,
    rating: params.rating,
    review: params.review,
    email: params.email ?? null,
  });

  if (error) {
    console.error("insertCommunityReview error:", error);
    return { error: error.message };
  }
  return { error: null };
}

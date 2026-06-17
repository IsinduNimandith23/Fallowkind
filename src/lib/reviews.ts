import { supabase } from "./supabase";

// A product review as shown publicly. The shopper's email is deliberately
// left out of this shape - it is never exposed to the storefront.
export type ProductReview = {
  id: number;
  name: string;
  rating: number;
  review: string;
  createdAt: string;
};

type ProductReviewRow = {
  id: number;
  name: string;
  rating: number;
  review: string;
  created_at: string;
};

function rowToReview(row: ProductReviewRow): ProductReview {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    review: row.review,
    createdAt: row.created_at,
  };
}

// Approved reviews for one product, newest first. Used to render the
// public reviews widget on the product page.
export async function getApprovedProductReviews(
  productId: number
): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, name, rating, review, created_at")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getApprovedProductReviews error:", error);
    return [];
  }
  return (data as ProductReviewRow[]).map(rowToReview);
}

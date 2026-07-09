import type { Metadata } from "next";

// The public FallowFam page. The full implementation lives in the sibling
// `fallowfam-preview` route (kept for owner review); this route renders the
// same component with public, indexable metadata.
export { default } from "../fallowfam-preview/page";

export const metadata: Metadata = {
  title: "FallowFam",
  description:
    "Rooted Together - the Fallowkind community of people choosing comfort, nature and conscious living. Photos, stories, reels and our collective impact.",
  alternates: { canonical: "/fallowfam" },
  openGraph: {
    title: "FallowFam | Fallowkind",
    description:
      "A community of people choosing comfort, nature and conscious living.",
    url: "/fallowfam",
    type: "website",
  },
};

export const revalidate = 3600;

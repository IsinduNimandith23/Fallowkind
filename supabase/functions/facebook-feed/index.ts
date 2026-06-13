// Supabase Edge Function: facebook-feed
// Generates a Facebook Product Catalog CSV feed for Fallowkind.
// Public endpoint (no auth) — consumed directly by Facebook's catalog crawler.
//
// Deploy:
//   supabase functions deploy facebook-feed --project-ref bhrntzarynnzhtbasmkj
// Feed URL:
//   https://bhrntzarynnzhtbasmkj.supabase.co/functions/v1/facebook-feed

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STORE_URL = "https://fallowkind.com";
const BRAND = "Fallowkind";
const CURRENCY = "LKR";

// Facebook-required column headers, in order.
const HEADERS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
];

// Escape a value per RFC 4180: wrap in quotes if it contains a comma,
// quote, or newline, and double any embedded quotes.
function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

Deno.serve(async (req: Request): Promise<Response> => {
  // Preflight support, harmless for a public GET endpoint.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, price_value, image_url, in_stock, description");

    if (error) {
      throw error;
    }

    const rows: string[] = [HEADERS.join(",")];

    for (const product of data ?? []) {
      const description =
        product.description && String(product.description).trim().length > 0
          ? product.description
          : `${product.category} - ${product.name}`;

      const fields = [
        product.id,
        product.name,
        description,
        product.in_stock ? "in stock" : "out of stock",
        "new",
        `${product.price_value} ${CURRENCY}`,
        `${STORE_URL}/shop/${product.id}`,
        product.image_url,
        BRAND,
      ];

      rows.push(fields.map(csvEscape).join(","));
    }

    const csv = rows.join("\r\n");

    return new Response(csv, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("facebook-feed error:", err);
    return new Response(
      `Error generating feed: ${err instanceof Error ? err.message : String(err)}`,
      {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "text/plain; charset=utf-8",
        },
      },
    );
  }
});

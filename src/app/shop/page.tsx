import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import ShopGrid from "./ShopGrid";

export const metadata: Metadata = { title: "Shop" };
export const revalidate = 0;

export default async function ShopPage() {
  const products = await getAllProducts();
  return <ShopGrid products={products} />;
}

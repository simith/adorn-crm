import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

type CatalogueCategory = "necklaces_pendants" | "earrings" | "others";

type CatalogueItem = {
  product_id: string;
  image: string;
  description: string;
};

function categoryForProduct(productId: string): CatalogueCategory {
  const code = productId.toUpperCase();

  if (code.startsWith("ER")) {
    return "earrings";
  }

  if (code.startsWith("NK") || code.startsWith("ND") || code.startsWith("PD")) {
    return "necklaces_pendants";
  }

  return "others";
}

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "catalogue.json");
  const raw = await readFile(filePath, "utf-8");
  const payload = JSON.parse(raw) as CatalogueItem[];

  const response = NextResponse.json({
    title: "Necklaces, Pendants & Earrings",
    subtitle: "Browse our exclusive collection of necklaces, pendants and earrings.",
    items: payload.map((item) => ({
      ...item,
      category: categoryForProduct(item.product_id)
    }))
  });

  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

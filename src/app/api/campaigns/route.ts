import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const filePath = path.join(process.cwd(), "data", "campaigns_list.json");
    const raw = await readFile(filePath, "utf-8");
    const payload = JSON.parse(raw) as {
        title: string;
        subtitle: string;
        campaigns: Array<{
            id: string;
            name: string;
            description: string;
            status: string;
            audience: number;
            updatedAt: string;
        }>;
    };

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const campaigns =
        status && status.trim()
            ? payload.campaigns.filter(
                  (campaign) => campaign.status.toLowerCase() === status.trim().toLowerCase()
              )
            : payload.campaigns;

    const response = NextResponse.json({
        title: payload.title,
        subtitle: payload.subtitle,
        campaigns,
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}

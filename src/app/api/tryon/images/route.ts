import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
    try {
        // Fetch images from session_events that have an image_url in payload
        const { data: eventRows, error } = await supabase
            .from("session_events")
            .select("event_id, session_id, event_type, timestamp, payload")
            .not("payload->image_url", "is", null)
            .order("timestamp", { ascending: false });

        if (error) {
            console.error("Failed to fetch images from Supabase:", error.message);
            return NextResponse.json({ images: [] }, { headers: CORS_HEADERS });
        }

        const images = (eventRows || []).map((row) => {
            const payload = row.payload as Record<string, unknown>;
            return {
                id: row.event_id,
                session_id: row.session_id,
                event_type: row.event_type,
                timestamp: row.timestamp,
                url: payload.image_url as string,
                customerName: (payload.jewelry_name as string) || "Try-On",
                jewelryName: (payload.jewelry_name as string) || "Jewelry",
                jewellery_id: payload.jewellery_id as string | undefined,
            };
        });

        return NextResponse.json({ images }, { headers: CORS_HEADERS });
    } catch (error) {
        console.error("Failed to list images:", error);
        return NextResponse.json({ images: [], error: "Failed to list images" }, { headers: CORS_HEADERS });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

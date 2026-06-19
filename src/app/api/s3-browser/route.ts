import { NextRequest, NextResponse } from "next/server";

import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export type S3ImageType = "original" | "result" | "adorned";

export type S3Image = {
    key: string;
    type: S3ImageType;
    attireId: string | null;
    attireName?: string;
    jewelryName?: string;
};

export type S3Session = {
    sessionId: string;
    sessionTime: string;
    images: S3Image[];
};

export type S3Customer = {
    email: string;
    sessions: S3Session[];
};

type SupabaseEventRow = {
    event_id: string;
    session_id: string;
    event_type: string;
    timestamp: string;
    payload: Record<string, unknown>;
};

type SupabaseSessionRow = {
    session_id: string;
    email_id: string;
    started_at: string;
    session_events: SupabaseEventRow[];
};

export async function GET(request: NextRequest) {
    try {
        const date = request.nextUrl.searchParams.get("date");

        const { data: rows, error } = await getSupabase()
            .from("sessions")
            .select("session_id, email_id, started_at, session_events(*)")
            .order("started_at", { ascending: false });

        if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

        const sessions = (rows || []) as SupabaseSessionRow[];

        if (!date) {
            const dateSet = new Set<string>();
            for (const session of sessions) {
                const d = session.started_at?.split("T")[0];
                if (d) dateSet.add(d);
            }
            const dates = [...dateSet].sort().reverse();
            return NextResponse.json({ ok: true, dates });
        }

        // customer email → session_id → images
        const byCustomer = new Map<string, Map<string, { sessionTime: string; images: S3Image[] }>>();

        for (const session of sessions) {
            const sessionDate = session.started_at?.split("T")[0];
            if (sessionDate !== date) continue;

            const email = session.email_id || "unknown";
            const sessionId = session.session_id;
            // HH-MM-SS from started_at for display
            const sessionTime = session.started_at?.slice(11, 19).replace(/:/g, "-") ?? "";

            for (const event of session.session_events || []) {
                const payload = event.payload as Record<string, unknown>;
                const attireId = typeof payload.attire_id === "string" ? payload.attire_id : null;
                const attireName = typeof payload.attire_name === "string" ? payload.attire_name : undefined;
                const jewelryName = typeof payload.jewelry_name === "string" ? payload.jewelry_name : undefined;

                const newImages: S3Image[] = [];

                if (event.event_type === "photo.captured" && typeof payload.s3_key === "string") {
                    newImages.push({ key: payload.s3_key, type: "original", attireId: null });
                }

                if (event.event_type === "image_generated" || event.event_type === "image.generated") {
                    if (typeof payload.s3_key === "string") {
                        newImages.push({ key: payload.s3_key, type: "result", attireId, attireName, jewelryName });
                    }
                    if (typeof payload.s3_key_adorned === "string") {
                        newImages.push({ key: payload.s3_key_adorned, type: "adorned", attireId, attireName, jewelryName });
                    }
                }

                if (newImages.length === 0) continue;

                if (!byCustomer.has(email)) byCustomer.set(email, new Map());
                const sessMap = byCustomer.get(email)!;
                if (!sessMap.has(sessionId)) sessMap.set(sessionId, { sessionTime, images: [] });
                sessMap.get(sessionId)!.images.push(...newImages);
            }
        }

        const customers: S3Customer[] = [...byCustomer.entries()].map(([email, sessMap]) => ({
            email,
            sessions: [...sessMap.entries()]
                .sort(([, a], [, b]) => b.sessionTime.localeCompare(a.sessionTime))
                .map(([sessionId, { sessionTime, images }]) => ({
                    sessionId,
                    sessionTime,
                    images: images.sort((a, b) => {
                        const order: Record<S3ImageType, number> = { original: 0, result: 1, adorned: 2 };
                        return order[a.type] - order[b.type];
                    }),
                })),
        }));

        return NextResponse.json({ ok: true, date, customers });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}

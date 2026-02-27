import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SessionEvent = {
    event_id: string;
    event_type: string;
    timestamp: string;
    jewellery_id?: string;
    jewelry_name?: string;
    jewelry_category?: string;
    price?: number;
    image_url?: string;
    attire_id?: string;
    attire_name?: string;
    generation_time_ms?: number;
    channel?: string;
    destination?: string;
    jeweler_id?: string;
    jeweler_name?: string;
    share_status?: string;
    message_sid?: string;
    duration_seconds?: number;
    items_tried?: number;
    items_shared?: number;
    sale_made?: boolean;
    sale_amount?: number;
    purchased_items?: string[];
    notes?: string;
    next_best_action_summary?: string;
    user_id?: string;
};

type SessionRecord = {
    session_id: string;
    user_name: string;
    email_id: string;
    mob_number: string;
    started_at: string;
    last_event_at: string;
    events: SessionEvent[];
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
    user_name: string;
    email_id: string;
    mob_number: string;
    started_at: string;
    last_event_at: string;
};

function toEpoch(timestamp: string) {
    return new Date(timestamp).getTime();
}

function compareTimestampAsc(a: SessionEvent, b: SessionEvent) {
    return toEpoch(a.timestamp) - toEpoch(b.timestamp);
}

function parseTimestamp(value: unknown) {
    if (typeof value === "string" && value.trim()) {
        const parsedDate = Date.parse(value);
        if (!Number.isNaN(parsedDate)) {
            return new Date(parsedDate).toISOString();
        }
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        const epochMs = value < 1_000_000_000_000 ? value * 1000 : value;
        const parsed = new Date(epochMs);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString();
        }
    }

    return new Date().toISOString();
}

function createSessionId() {
    return `sess_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function eventToPayload(event: SessionEvent): Record<string, unknown> {
    const { event_id: _id, event_type: _type, timestamp: _ts, ...rest } = event;
    return rest;
}

function eventRowToSessionEvent(row: SupabaseEventRow): SessionEvent {
    return {
        event_id: row.event_id,
        event_type: row.event_type,
        timestamp: row.timestamp,
        ...(row.payload as Record<string, unknown>),
    };
}

function sessionRowToRecord(row: SupabaseSessionRow, eventRows: SupabaseEventRow[]): SessionRecord {
    const events = eventRows
        .filter((e) => e.session_id === row.session_id)
        .map(eventRowToSessionEvent)
        .sort(compareTimestampAsc);

    return {
        session_id: row.session_id,
        user_name: row.user_name,
        email_id: row.email_id,
        mob_number: row.mob_number,
        started_at: row.started_at,
        last_event_at: row.last_event_at,
        events,
    };
}

// --- Supabase write helpers ---

async function insertSession(session: {
    session_id: string;
    user_name: string;
    email_id: string;
    mob_number: string;
    started_at: string;
    last_event_at: string;
}) {
    const { error } = await supabase.from("sessions").insert(session);
    if (error) throw new Error(`[Supabase] session insert failed: ${error.message}`);
}

async function insertEvent(sessionId: string, event: SessionEvent) {
    const { error } = await supabase.from("session_events").insert({
        event_id: event.event_id,
        session_id: sessionId,
        event_type: event.event_type,
        timestamp: event.timestamp,
        payload: eventToPayload(event),
    });
    if (error) throw new Error(`[Supabase] event insert failed: ${error.message}`);
}

async function updateSessionLastEvent(sessionId: string, lastEventAt: string) {
    const { error } = await supabase
        .from("sessions")
        .update({ last_event_at: lastEventAt })
        .eq("session_id", sessionId);
    if (error) throw new Error(`[Supabase] session update failed: ${error.message}`);
}

// --- Supabase read helpers ---

async function fetchSessionFromSupabase(sessionId: string): Promise<SessionRecord | null> {
    const { data: sessionRow, error: sessionErr } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_id", sessionId)
        .single();

    if (sessionErr || !sessionRow) return null;

    const { data: eventRows, error: eventsErr } = await supabase
        .from("session_events")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: true });

    if (eventsErr) return null;

    return sessionRowToRecord(sessionRow as SupabaseSessionRow, (eventRows || []) as SupabaseEventRow[]);
}

async function fetchAllSessionsFromSupabase(): Promise<{ sessions: SessionRecord[]; totalEvents: number }> {
    const { data: sessionRows, error: sessionErr } = await supabase
        .from("sessions")
        .select("*")
        .order("last_event_at", { ascending: false });

    if (sessionErr) throw new Error(`[Supabase] sessions fetch failed: ${sessionErr.message}`);

    const { data: eventRows, error: eventsErr } = await supabase
        .from("session_events")
        .select("*")
        .order("timestamp", { ascending: true });

    if (eventsErr) throw new Error(`[Supabase] events fetch failed: ${eventsErr.message}`);

    const typedEvents = (eventRows || []) as SupabaseEventRow[];
    const sessions = ((sessionRows || []) as SupabaseSessionRow[]).map((row) =>
        sessionRowToRecord(row, typedEvents),
    );

    return { sessions, totalEvents: typedEvents.length };
}

// --- POST handler ---

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : null;

        console.log("=== INCOMING EVENT ===");
        console.log("Timestamp:", new Date().toISOString());
        console.log("Body:", JSON.stringify(raw, null, 2));

        if (!raw) {
            console.error("=== EVENT ERROR: Invalid JSON payload ===");
            return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
        }

        const eventType = typeof raw.event_type === "string" ? raw.event_type.trim() : "";
        const timestamp = parseTimestamp(raw.timestamp);

        if (!eventType) {
            return NextResponse.json({ ok: false, error: "event_type is required." }, { status: 400 });
        }

        if (eventType === "start_session") {
            const userName = typeof raw.user_name === "string" ? raw.user_name.trim() : "";
            const emailId = typeof raw.email_id === "string" ? raw.email_id.trim() : "";
            const mobNumber = typeof raw.mob_number === "string" ? raw.mob_number.trim() : "";

            if (!userName || !emailId || !mobNumber) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "start_session requires user_name, email_id, and mob_number.",
                    },
                    { status: 400 },
                );
            }

            const sessionId = createSessionId();
            const startEvent: SessionEvent = {
                event_id: randomUUID(),
                event_type: "start_session",
                timestamp,
            };

            await insertSession({
                session_id: sessionId,
                user_name: userName,
                email_id: emailId,
                mob_number: mobNumber,
                started_at: timestamp,
                last_event_at: timestamp,
            });
            await insertEvent(sessionId, startEvent);

            console.log("=== SESSION STARTED ===");
            console.log("Session ID:", sessionId);
            console.log("User:", userName);

            const session = await fetchSessionFromSupabase(sessionId);
            const allData = await fetchAllSessionsFromSupabase();

            return NextResponse.json(
                {
                    ok: true,
                    message: "Session started",
                    session_id: sessionId,
                    session,
                    totalSessions: allData.sessions.length,
                    totalEvents: allData.totalEvents,
                },
                { status: 201 },
            );
        }

        const sessionId = typeof raw.session_id === "string" ? raw.session_id.trim() : "";
        if (!sessionId) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "session_id is required for non start_session events.",
                },
                { status: 400 },
            );
        }

        // Verify session exists
        const existingSession = await fetchSessionFromSupabase(sessionId);
        if (!existingSession) {
            return NextResponse.json(
                {
                    ok: false,
                    error: `Session not found for session_id: ${sessionId}`,
                },
                { status: 404 },
            );
        }

        const jewelleryId =
            typeof raw.jewellery_id === "string" && raw.jewellery_id.trim()
                ? raw.jewellery_id.trim()
                : typeof raw.jewelry_id === "string"
                  ? raw.jewelry_id.trim()
                  : "";
        const jewelryName = typeof raw.jewelry_name === "string" ? raw.jewelry_name.trim() : "";
        const jewelryCategory = typeof raw.jewelry_category === "string" ? raw.jewelry_category.trim() : "";
        const imageUrl = typeof raw.image_url === "string" ? raw.image_url.trim() : "";
        const channel = typeof raw.channel === "string" ? raw.channel.trim() : "";
        const destination = typeof raw.destination === "string" ? raw.destination.trim() : "";
        const jewelerId = typeof raw.jeweler_id === "string" ? raw.jeweler_id.trim() : "";
        const jewelerName = typeof raw.jeweler_name === "string" ? raw.jeweler_name.trim() : "";
        const shareStatus = typeof raw.share_status === "string" ? raw.share_status.trim() : "";
        const messageSid = typeof raw.message_sid === "string" ? raw.message_sid.trim() : "";
        const attireId = typeof raw.attire_id === "string" ? raw.attire_id.trim() : "";
        const attireName = typeof raw.attire_name === "string" ? raw.attire_name.trim() : "";
        const rawPrice = raw.price;
        const rawGenerationTime = raw.generation_time_ms;
        const rawDurationSeconds = raw.duration_seconds;
        const rawItemsTried = raw.items_tried;
        const rawItemsShared = raw.items_shared;
        const rawSaleAmount = raw.sale_amount;
        const price =
            typeof rawPrice === "number" && Number.isFinite(rawPrice)
                ? rawPrice
                : typeof rawPrice === "string" && rawPrice.trim()
                  ? Number(rawPrice)
                  : null;
        const generationTimeMs =
            typeof rawGenerationTime === "number" && Number.isFinite(rawGenerationTime)
                ? rawGenerationTime
                : typeof rawGenerationTime === "string" && rawGenerationTime.trim()
                  ? Number(rawGenerationTime)
                  : null;
        const durationSeconds =
            typeof rawDurationSeconds === "number" && Number.isFinite(rawDurationSeconds)
                ? rawDurationSeconds
                : typeof rawDurationSeconds === "string" && rawDurationSeconds.trim()
                  ? Number(rawDurationSeconds)
                  : null;
        const itemsTried =
            typeof rawItemsTried === "number" && Number.isFinite(rawItemsTried)
                ? rawItemsTried
                : typeof rawItemsTried === "string" && rawItemsTried.trim()
                  ? Number(rawItemsTried)
                  : null;
        const itemsShared =
            typeof rawItemsShared === "number" && Number.isFinite(rawItemsShared)
                ? rawItemsShared
                : typeof rawItemsShared === "string" && rawItemsShared.trim()
                  ? Number(rawItemsShared)
                  : null;
        const saleAmount =
            typeof rawSaleAmount === "number" && Number.isFinite(rawSaleAmount)
                ? rawSaleAmount
                : typeof rawSaleAmount === "string" && rawSaleAmount.trim()
                  ? Number(rawSaleAmount)
                  : null;
        const saleMade =
            typeof raw.sale_made === "boolean"
                ? raw.sale_made
                : typeof raw.sale_made === "string" && raw.sale_made.trim()
                  ? raw.sale_made.trim().toLowerCase() === "true"
                      ? true
                      : raw.sale_made.trim().toLowerCase() === "false"
                        ? false
                        : null
                  : null;
        const purchasedItems = Array.isArray(raw.purchased_items)
            ? raw.purchased_items
                  .filter((item): item is string => typeof item === "string")
                  .map((item) => item.trim())
                  .filter(Boolean)
            : [];
        const notes = typeof raw.notes === "string" ? raw.notes.trim() : "";
        const nextBestActionSummary =
            typeof raw.next_best_action_summary === "string" ? raw.next_best_action_summary.trim() : "";
        const userId = typeof raw.user_id === "string" ? raw.user_id.trim() : "";

        const event: SessionEvent = {
            event_id: randomUUID(),
            event_type: eventType,
            timestamp,
            ...(jewelleryId ? { jewellery_id: jewelleryId } : {}),
            ...(jewelryName ? { jewelry_name: jewelryName } : {}),
            ...(jewelryCategory ? { jewelry_category: jewelryCategory } : {}),
            ...(typeof price === "number" && Number.isFinite(price) ? { price } : {}),
            ...(imageUrl ? { image_url: imageUrl } : {}),
            ...(channel ? { channel } : {}),
            ...(destination ? { destination } : {}),
            ...(jewelerId ? { jeweler_id: jewelerId } : {}),
            ...(jewelerName ? { jeweler_name: jewelerName } : {}),
            ...(shareStatus ? { share_status: shareStatus } : {}),
            ...(messageSid ? { message_sid: messageSid } : {}),
            ...(attireId ? { attire_id: attireId } : {}),
            ...(attireName ? { attire_name: attireName } : {}),
            ...(typeof generationTimeMs === "number" && Number.isFinite(generationTimeMs)
                ? { generation_time_ms: generationTimeMs }
                : {}),
            ...(typeof durationSeconds === "number" && Number.isFinite(durationSeconds)
                ? { duration_seconds: durationSeconds }
                : {}),
            ...(typeof itemsTried === "number" && Number.isFinite(itemsTried) ? { items_tried: itemsTried } : {}),
            ...(typeof itemsShared === "number" && Number.isFinite(itemsShared) ? { items_shared: itemsShared } : {}),
            ...(typeof saleMade === "boolean" ? { sale_made: saleMade } : {}),
            ...(typeof saleAmount === "number" && Number.isFinite(saleAmount) ? { sale_amount: saleAmount } : {}),
            ...(purchasedItems.length > 0 ? { purchased_items: purchasedItems } : {}),
            ...(notes ? { notes } : {}),
            ...(nextBestActionSummary ? { next_best_action_summary: nextBestActionSummary } : {}),
            ...(userId ? { user_id: userId } : {}),
        };

        await insertEvent(sessionId, event);

        // Update last_event_at to the latest event timestamp
        const newLastEventAt =
            toEpoch(timestamp) > toEpoch(existingSession.last_event_at) ? timestamp : existingSession.last_event_at;
        await updateSessionLastEvent(sessionId, newLastEventAt);

        console.log("=== EVENT STORED ===");
        console.log("Session ID:", sessionId);
        console.log("Event Type:", eventType);
        console.log("Event ID:", event.event_id);

        const updatedSession = await fetchSessionFromSupabase(sessionId);

        return NextResponse.json({
            ok: true,
            message: "Event stored in session",
            session_id: sessionId,
            event,
            sessionEventCount: updatedSession?.events.length ?? 0,
        });
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error("=== EVENT ERROR ===", details);
        return NextResponse.json(
            {
                ok: false,
                error: "Failed to process event.",
                details,
            },
            { status: 500 },
        );
    }
}

// --- GET handler ---

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("session_id")?.trim();

        if (sessionId) {
            const session = await fetchSessionFromSupabase(sessionId);
            if (!session) {
                return NextResponse.json(
                    { ok: false, error: `Session not found for session_id: ${sessionId}` },
                    { status: 404 },
                );
            }

            const response = NextResponse.json({
                ok: true,
                session,
            });
            response.headers.set("Cache-Control", "no-store, max-age=0");
            return response;
        }

        const allData = await fetchAllSessionsFromSupabase();
        const response = NextResponse.json({
            ok: true,
            totalSessions: allData.sessions.length,
            totalEvents: allData.totalEvents,
            sessions: allData.sessions,
        });
        response.headers.set("Cache-Control", "no-store, max-age=0");
        return response;
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error("=== GET ERROR ===", details);
        return NextResponse.json(
            {
                ok: false,
                error: "Failed to fetch sessions.",
                details,
            },
            { status: 500 },
        );
    }
}

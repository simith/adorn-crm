import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

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

type PersistedStore = {
    version: number;
    totalEvents: number;
    sessions: SessionRecord[];
};

const CACHE_RELATIVE_PATH = "cache/sessions.json";
const CACHE_DIR_PATH = path.join(process.cwd(), "cache");
const CACHE_FILE_PATH = path.join(process.cwd(), CACHE_RELATIVE_PATH);

const DEFAULT_SESSIONS: SessionRecord[] = [
    {
        session_id: "sess_seed_01",
        user_name: "Aarav Menon",
        email_id: "aarav@example.com",
        mob_number: "9876500001",
        started_at: "2026-02-23T10:00:00.000Z",
        last_event_at: "2026-02-23T10:11:00.000Z",
        events: [
            {
                event_id: "seed_evt_1",
                event_type: "start_session",
                timestamp: "2026-02-23T10:00:00.000Z",
            },
            {
                event_id: "seed_evt_2",
                event_type: "view",
                jewellery_id: "JW-1001",
                timestamp: "2026-02-23T10:05:00.000Z",
            },
            {
                event_id: "seed_evt_3",
                event_type: "wishlist",
                jewellery_id: "JW-1001",
                timestamp: "2026-02-23T10:11:00.000Z",
            },
        ],
    },
    {
        session_id: "sess_seed_02",
        user_name: "Nisha Iyer",
        email_id: "nisha@example.com",
        mob_number: "9876500002",
        started_at: "2026-02-23T11:30:00.000Z",
        last_event_at: "2026-02-23T11:41:00.000Z",
        events: [
            {
                event_id: "seed_evt_4",
                event_type: "start_session",
                timestamp: "2026-02-23T11:30:00.000Z",
            },
            {
                event_id: "seed_evt_5",
                event_type: "view",
                jewellery_id: "JW-2004",
                timestamp: "2026-02-23T11:36:00.000Z",
            },
            {
                event_id: "seed_evt_6",
                event_type: "share",
                timestamp: "2026-02-23T11:41:00.000Z",
            },
        ],
    },
];

let sessionsById = new Map<string, SessionRecord>();
let totalEvents = 0;
let hydratePromise: Promise<void> | null = null;

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

function countTotalEvents(sessions: SessionRecord[]) {
    return sessions.reduce((count, session) => count + session.events.length, 0);
}

function normalizeEvent(raw: unknown, fallbackTimestamp: string): SessionEvent {
    const payload = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const eventType =
        typeof payload.event_type === "string" && payload.event_type.trim() ? payload.event_type.trim() : "view";
    const timestamp = parseTimestamp(payload.timestamp ?? fallbackTimestamp);
    const event: SessionEvent = {
        event_id:
            typeof payload.event_id === "string" && payload.event_id.trim() ? payload.event_id.trim() : randomUUID(),
        event_type: eventType,
        timestamp,
    };

    const jewelleryIdRaw =
        typeof payload.jewellery_id === "string" && payload.jewellery_id.trim()
            ? payload.jewellery_id.trim()
            : typeof payload.jewelry_id === "string" && payload.jewelry_id.trim()
              ? payload.jewelry_id.trim()
              : "";
    if (jewelleryIdRaw) {
        event.jewellery_id = jewelleryIdRaw;
    }

    if (typeof payload.jewelry_name === "string" && payload.jewelry_name.trim()) {
        event.jewelry_name = payload.jewelry_name.trim();
    }

    if (typeof payload.jewelry_category === "string" && payload.jewelry_category.trim()) {
        event.jewelry_category = payload.jewelry_category.trim();
    }

    const priceRaw = payload.price;
    if (typeof priceRaw === "number" && Number.isFinite(priceRaw)) {
        event.price = priceRaw;
    } else if (typeof priceRaw === "string" && priceRaw.trim()) {
        const parsed = Number(priceRaw);
        if (Number.isFinite(parsed)) {
            event.price = parsed;
        }
    }

    if (typeof payload.image_url === "string" && payload.image_url.trim()) {
        event.image_url = payload.image_url.trim();
    }

    if (typeof payload.channel === "string" && payload.channel.trim()) {
        event.channel = payload.channel.trim();
    }

    if (typeof payload.destination === "string" && payload.destination.trim()) {
        event.destination = payload.destination.trim();
    }

    if (typeof payload.jeweler_id === "string" && payload.jeweler_id.trim()) {
        event.jeweler_id = payload.jeweler_id.trim();
    }

    if (typeof payload.jeweler_name === "string" && payload.jeweler_name.trim()) {
        event.jeweler_name = payload.jeweler_name.trim();
    }

    if (typeof payload.share_status === "string" && payload.share_status.trim()) {
        event.share_status = payload.share_status.trim();
    }

    if (typeof payload.message_sid === "string" && payload.message_sid.trim()) {
        event.message_sid = payload.message_sid.trim();
    }

    if (typeof payload.attire_id === "string" && payload.attire_id.trim()) {
        event.attire_id = payload.attire_id.trim();
    }

    if (typeof payload.attire_name === "string" && payload.attire_name.trim()) {
        event.attire_name = payload.attire_name.trim();
    }

    const generationTimeRaw = payload.generation_time_ms;
    if (typeof generationTimeRaw === "number" && Number.isFinite(generationTimeRaw)) {
        event.generation_time_ms = generationTimeRaw;
    } else if (typeof generationTimeRaw === "string" && generationTimeRaw.trim()) {
        const parsed = Number(generationTimeRaw);
        if (Number.isFinite(parsed)) {
            event.generation_time_ms = parsed;
        }
    }

    const durationSecondsRaw = payload.duration_seconds;
    if (typeof durationSecondsRaw === "number" && Number.isFinite(durationSecondsRaw)) {
        event.duration_seconds = durationSecondsRaw;
    } else if (typeof durationSecondsRaw === "string" && durationSecondsRaw.trim()) {
        const parsed = Number(durationSecondsRaw);
        if (Number.isFinite(parsed)) {
            event.duration_seconds = parsed;
        }
    }

    const itemsTriedRaw = payload.items_tried;
    if (typeof itemsTriedRaw === "number" && Number.isFinite(itemsTriedRaw)) {
        event.items_tried = itemsTriedRaw;
    } else if (typeof itemsTriedRaw === "string" && itemsTriedRaw.trim()) {
        const parsed = Number(itemsTriedRaw);
        if (Number.isFinite(parsed)) {
            event.items_tried = parsed;
        }
    }

    const itemsSharedRaw = payload.items_shared;
    if (typeof itemsSharedRaw === "number" && Number.isFinite(itemsSharedRaw)) {
        event.items_shared = itemsSharedRaw;
    } else if (typeof itemsSharedRaw === "string" && itemsSharedRaw.trim()) {
        const parsed = Number(itemsSharedRaw);
        if (Number.isFinite(parsed)) {
            event.items_shared = parsed;
        }
    }

    if (typeof payload.sale_made === "boolean") {
        event.sale_made = payload.sale_made;
    } else if (typeof payload.sale_made === "string" && payload.sale_made.trim()) {
        const normalized = payload.sale_made.trim().toLowerCase();
        if (normalized === "true") {
            event.sale_made = true;
        } else if (normalized === "false") {
            event.sale_made = false;
        }
    }

    const saleAmountRaw = payload.sale_amount;
    if (typeof saleAmountRaw === "number" && Number.isFinite(saleAmountRaw)) {
        event.sale_amount = saleAmountRaw;
    } else if (typeof saleAmountRaw === "string" && saleAmountRaw.trim()) {
        const parsed = Number(saleAmountRaw);
        if (Number.isFinite(parsed)) {
            event.sale_amount = parsed;
        }
    }

    if (Array.isArray(payload.purchased_items)) {
        const purchasedItems = payload.purchased_items
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
        if (purchasedItems.length > 0) {
            event.purchased_items = purchasedItems;
        }
    }

    if (typeof payload.notes === "string" && payload.notes.trim()) {
        event.notes = payload.notes.trim();
    }

    if (typeof payload.next_best_action_summary === "string" && payload.next_best_action_summary.trim()) {
        event.next_best_action_summary = payload.next_best_action_summary.trim();
    }

    if (typeof payload.user_id === "string" && payload.user_id.trim()) {
        event.user_id = payload.user_id.trim();
    }

    return event;
}

function normalizeSession(raw: unknown, index = 0): SessionRecord {
    const payload = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const startedAt = parseTimestamp(payload.started_at);

    const parsedEvents = Array.isArray(payload.events)
        ? payload.events.map((event) => normalizeEvent(event, startedAt))
        : [];

    const events =
        parsedEvents.length > 0
            ? parsedEvents.sort(compareTimestampAsc)
            : [
                  {
                      event_id: randomUUID(),
                      event_type: "start_session",
                      timestamp: startedAt,
                  },
              ];

    return {
        session_id:
            typeof payload.session_id === "string" && payload.session_id.trim()
                ? payload.session_id.trim()
                : `sess_seed_${String(index + 1).padStart(2, "0")}`,
        user_name:
            typeof payload.user_name === "string" && payload.user_name.trim()
                ? payload.user_name.trim()
                : `User ${index + 1}`,
        email_id:
            typeof payload.email_id === "string" && payload.email_id.trim()
                ? payload.email_id.trim()
                : `user${index + 1}@example.com`,
        mob_number:
            typeof payload.mob_number === "string" && payload.mob_number.trim()
                ? payload.mob_number.trim()
                : `90000000${String(index + 1).padStart(2, "0")}`,
        started_at: startedAt,
        last_event_at: events[events.length - 1]?.timestamp || startedAt,
        events,
    };
}

function sessionsFromPayload(payload: unknown) {
    if (Array.isArray(payload)) {
        return payload.map((session, index) => normalizeSession(session, index));
    }

    if (payload && typeof payload === "object" && Array.isArray((payload as { sessions?: unknown[] }).sessions)) {
        return (payload as { sessions: unknown[] }).sessions.map((session, index) => normalizeSession(session, index));
    }

    return [];
}

function sortedSessionsForResponse() {
    return [...sessionsById.values()]
        .map((session) => normalizeSession(session))
        .sort((a, b) => toEpoch(b.last_event_at) - toEpoch(a.last_event_at));
}

function serializeStore(): PersistedStore {
    return {
        version: 1,
        totalEvents,
        sessions: sortedSessionsForResponse(),
    };
}

async function persistStore() {
    await mkdir(CACHE_DIR_PATH, { recursive: true });
    await writeFile(CACHE_FILE_PATH, JSON.stringify(serializeStore(), null, 2), "utf-8");
}

async function hydrateStore() {
    if (hydratePromise) {
        return hydratePromise;
    }

    hydratePromise = (async () => {
        await mkdir(CACHE_DIR_PATH, { recursive: true });

        try {
            const raw = await readFile(CACHE_FILE_PATH, "utf-8");
            const parsed = JSON.parse(raw) as PersistedStore;
            const sessions = sessionsFromPayload(parsed);

            if (sessions.length > 0) {
                sessionsById = new Map(sessions.map((session) => [session.session_id, session]));
                totalEvents =
                    typeof parsed.totalEvents === "number" && Number.isFinite(parsed.totalEvents)
                        ? parsed.totalEvents
                        : countTotalEvents(sessions);
                return;
            }
        } catch (error) {
            const err = error as NodeJS.ErrnoException;
            if (err.code !== "ENOENT") {
                console.warn("Failed to read cache file. Reinitializing from mock data.", err.message);
            }
        }

        const mockSessions = DEFAULT_SESSIONS.map((session, index) => normalizeSession(session, index));
        sessionsById = new Map(mockSessions.map((session) => [session.session_id, session]));
        totalEvents = countTotalEvents(mockSessions);
        await persistStore();
    })();

    return hydratePromise;
}

function createSessionId() {
    return `sess_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export async function POST(request: Request) {
    try {
        await hydrateStore();

        const body = await request.json().catch(() => null);
        const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : null;

        // Log incoming event
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

            const session: SessionRecord = {
                session_id: sessionId,
                user_name: userName,
                email_id: emailId,
                mob_number: mobNumber,
                started_at: timestamp,
                last_event_at: timestamp,
                events: [startEvent],
            };

            sessionsById.set(sessionId, session);
            totalEvents += 1;
            await persistStore();

            console.log("=== SESSION STARTED ===");
            console.log("Session ID:", sessionId);
            console.log("User:", userName);
            console.log("Email:", emailId);
            console.log("Phone:", mobNumber);
            console.log("Total Sessions:", sessionsById.size);
            console.log("Total Events:", totalEvents);

            return NextResponse.json(
                {
                    ok: true,
                    message: "Session started",
                    session_id: sessionId,
                    session: normalizeSession(session),
                    totalSessions: sessionsById.size,
                    totalEvents,
                    cacheFile: CACHE_RELATIVE_PATH,
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

        const session = sessionsById.get(sessionId);
        if (!session) {
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

        session.events.push(event);
        session.events.sort(compareTimestampAsc);
        session.last_event_at = session.events[session.events.length - 1]?.timestamp || session.last_event_at;

        sessionsById.set(sessionId, session);
        totalEvents += 1;
        await persistStore();

        console.log("=== EVENT STORED ===");
        console.log("Session ID:", sessionId);
        console.log("Event Type:", eventType);
        console.log("Event ID:", event.event_id);
        if (jewelleryId) console.log("Jewelry ID:", jewelleryId);
        if (jewelryName) console.log("Jewelry Name:", jewelryName);
        if (imageUrl) console.log("Image URL:", imageUrl);
        if (channel) console.log("Channel:", channel);
        if (destination) console.log("Destination:", destination);
        console.log("Session Event Count:", session.events.length);
        console.log("Total Events:", totalEvents);

        return NextResponse.json({
            ok: true,
            message: "Event stored in session",
            session_id: sessionId,
            event,
            sessionEventCount: session.events.length,
            totalEvents,
            cacheFile: CACHE_RELATIVE_PATH,
        });
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            {
                ok: false,
                error: "Failed to process /api_events POST request.",
                details,
            },
            { status: 500 },
        );
    }
}

export async function GET(request: Request) {
    await hydrateStore();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id")?.trim();

    if (sessionId) {
        const session = sessionsById.get(sessionId);
        if (!session) {
            return NextResponse.json(
                {
                    ok: false,
                    error: `Session not found for session_id: ${sessionId}`,
                },
                { status: 404 },
            );
        }

        const response = NextResponse.json({
            ok: true,
            session: normalizeSession(session),
            totalSessions: sessionsById.size,
            totalEvents,
            cacheFile: CACHE_RELATIVE_PATH,
        });
        response.headers.set("Cache-Control", "no-store, max-age=0");
        return response;
    }

    const response = NextResponse.json({
        ok: true,
        totalSessions: sessionsById.size,
        totalEvents,
        sessions: sortedSessionsForResponse(),
        cacheFile: CACHE_RELATIVE_PATH,
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}

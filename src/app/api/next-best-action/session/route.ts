import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SessionEventForSummary = {
    event_type?: string;
    timestamp?: string;
    jewelry_name?: string;
    jewellery_id?: string;
    price?: number;
    channel?: string;
    destination?: string;
    sale_made?: boolean;
    sale_amount?: number;
    notes?: string;
    purchased_items?: string[];
};

type SessionForSummary = {
    session_id?: string;
    user_name?: string;
    started_at?: string;
    events?: SessionEventForSummary[];
};

type SessionSummaryInput = {
    session: SessionForSummary | null;
    durationSeconds: number;
    itemsTried: number;
    itemsShared: number;
    saleMade: boolean;
    saleAmount: number;
    purchasedItems: string[];
    notes: string;
};

function asTrimmedString(value: unknown) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

function asOptionalNumber(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

function asOptionalBoolean(value: unknown) {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string" && value.trim()) {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") {
            return true;
        }
        if (normalized === "false") {
            return false;
        }
    }

    return null;
}

function asStringArray(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function summarizeEventType(eventType: string) {
    if (eventType === "session.start") return "session.start";
    if (eventType === "jewellery_selected" || eventType === "jewelry_selected" || eventType === "jewelry.selected") return "jewellery_selected";
    if (eventType === "image_generated" || eventType === "image.generated") return "image_generated";
    if (eventType === "image_shared" || eventType === "image.shared") return "image_shared";
    if (eventType === "session_ended" || eventType === "session.ended") return "session_ended";
    return eventType;
}

function toProfessionalProductCode(rawId?: string) {
    const value = (rawId || "").trim();
    if (!value) return "";

    const match = /^([a-zA-Z]+)[_-]?(\d+)$/.exec(value);
    if (!match) {
        return value.toUpperCase().replaceAll("_", "-");
    }

    const [, prefixRaw, numberRaw] = match;
    const prefix = prefixRaw.toLowerCase();
    const number = numberRaw.padStart(3, "0");
    const mappedPrefix =
        prefix === "necklace"
            ? "NCK"
            : prefix === "earring" || prefix === "earing"
              ? "EAR"
              : prefix === "ring"
                ? "RNG"
                : prefix === "bracelet"
                  ? "BRC"
                  : prefix === "pendant"
                    ? "PND"
                    : prefix === "mangalsutra"
                      ? "MGL"
                      : prefix.slice(0, 3).toUpperCase();

    return `${mappedPrefix}-${number}`;
}

function replaceProductIdsInText(text?: string) {
    const value = (text || "").trim();
    if (!value) return "";

    return value.replace(/\b([a-zA-Z]+)[_-](\d{1,4})\b/g, (_full, prefix, number) =>
        toProfessionalProductCode(`${String(prefix)}_${String(number)}`),
    );
}

function currencyLabel(amount: number) {
    return `Rs ${amount.toLocaleString("en-IN")}`;
}

function buildLocalNextBestActionSummary(input: SessionSummaryInput) {
    const events = [...(input.session?.events || [])];
    const eventMix = events.reduce<Record<string, number>>((acc, event) => {
        const key = summarizeEventType(asTrimmedString(event.event_type));
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const latestJewelry =
        [...events]
            .reverse()
            .find((event) => asTrimmedString(event.jewelry_name) || asTrimmedString(event.jewellery_id))
            ?.jewelry_name ||
        toProfessionalProductCode(
            [...events].reverse().find((event) => asTrimmedString(event.jewellery_id))?.jewellery_id,
        ) ||
        "the shortlisted jewellery";

    const shareChannel =
        [...events].reverse().find((event) => summarizeEventType(asTrimmedString(event.event_type)) === "image_shared")
            ?.channel || "the preferred channel";

    const saleOutcome = input.saleMade
        ? `The session converted successfully with a sale of ${currencyLabel(input.saleAmount)}`
        : "The session ended without a closed sale";
    const purchasedText =
        input.purchasedItems.length > 0
            ? `, including ${input.purchasedItems.map((item) => toProfessionalProductCode(item)).join(", ")}`
            : "";

    const nextAction = input.saleMade
        ? `Next best action: send a thank-you follow-up within 24 hours, recommend matching add-ons to ${latestJewelry}, and schedule a care-plan or styling follow-up.`
        : `Next best action: re-engage within 24 hours with a focused offer on ${latestJewelry}, include a limited-time value incentive, and provide assisted checkout guidance.`;

    return replaceProductIdsInText(
        `${saleOutcome}${purchasedText}. Customer explored ${input.itemsTried} items and shared ${input.itemsShared} images over ${Math.round(input.durationSeconds / 60)} minutes, with strongest intent around ${latestJewelry}. ` +
            `Behavioral trail shows ${eventMix.jewellery_selected || 0} jewellery selections, ${eventMix.image_generated || 0} generated try-ons, and ${eventMix.image_shared || 0} shares via ${shareChannel}. ` +
            `Client note: ${input.notes}. ${nextAction}`,
    );
}

async function generateNextBestActionSummaryWithGrok(input: SessionSummaryInput) {
    const fallback = buildLocalNextBestActionSummary(input);
    const apiKey = asTrimmedString(process.env.GROK_API_KEY);

    if (!apiKey) {
        return fallback;
    }

    const endpoint = asTrimmedString(process.env.GROK_API_URL) || "https://api.x.ai/v1/chat/completions";
    const model = asTrimmedString(process.env.GROK_MODEL) || "grok-2-latest";

    const compactEvents = [...(input.session?.events || [])].map((event) => ({
        event_type: summarizeEventType(asTrimmedString(event.event_type)),
        timestamp: event.timestamp,
        jewelry_name: event.jewelry_name,
        jewellery_id: event.jewellery_id,
        price: event.price,
        channel: event.channel,
        destination: event.destination,
        sale_made: event.sale_made,
        sale_amount: event.sale_amount,
    }));

    const promptPayload = {
        session_id: input.session?.session_id || "",
        user_name: input.session?.user_name || "",
        started_at: input.session?.started_at || "",
        session_end_metrics: {
            duration_seconds: input.durationSeconds,
            items_tried: input.itemsTried,
            items_shared: input.itemsShared,
            sale_made: input.saleMade,
            sale_amount: input.saleAmount,
            purchased_items: input.purchasedItems,
            notes: input.notes,
        },
        prior_events: compactEvents,
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                temperature: 0.2,
                max_tokens: 220,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a senior jewellery CRM strategist. Write one professional next-best-action summary in plain English, 80-130 words, focused on commercial follow-up action.",
                    },
                    {
                        role: "user",
                        content:
                            `Analyze the session and provide JSON with one key: {"next_best_action_summary":"..."}.\n` +
                            `Include conversion signal analysis, customer intent, and a concrete action plan.\n\n` +
                            `${JSON.stringify(promptPayload)}`,
                    },
                ],
            }),
            cache: "no-store",
        });

        const payload = (await response.json().catch(() => ({}))) as {
            choices?: Array<{ message?: { content?: string } }>;
        };

        if (!response.ok) {
            console.warn("Grok summary generation failed, falling back to local summary.", payload);
            return fallback;
        }

        const rawContent = asTrimmedString(payload.choices?.[0]?.message?.content);
        if (!rawContent) {
            return fallback;
        }

        const jsonStart = rawContent.indexOf("{");
        const jsonEnd = rawContent.lastIndexOf("}");
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const candidate = rawContent.slice(jsonStart, jsonEnd + 1);
            const parsed = JSON.parse(candidate) as { next_best_action_summary?: unknown };
            const summary = asTrimmedString(parsed.next_best_action_summary);
            if (summary) {
                return replaceProductIdsInText(summary);
            }
        }

        return replaceProductIdsInText(rawContent);
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.warn("Grok summary generation errored, using fallback summary.", details);
        return fallback;
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        if (!body) {
            return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
        }

        const eventType = asTrimmedString(body.event_type).toLowerCase();
        const customerName = asTrimmedString(body.customer_name);
        const customerPhone = asTrimmedString(body.customer_phone);
        const customerEmail = asTrimmedString(body.customer_email).toLowerCase();
        const jewelerId = asTrimmedString(body.jeweler_id);
        const jewelerName = asTrimmedString(body.jeweler_name);

        const apiEventsUrl = new URL("/api_events", request.url);

        if (eventType === "session.start") {
            if (!customerName || !customerPhone || !customerEmail || !jewelerId || !jewelerName) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "event_type, customer_name, customer_phone, customer_email, jeweler_id, and jeweler_name are required.",
                    },
                    { status: 400 },
                );
            }

            const mappedPayload = {
                event_type: "session.start",
                user_name: customerName,
                email_id: customerEmail,
                mob_number: customerPhone,
                timestamp: new Date().toISOString(),
                user_id: jewelerId,
            };

            const createSessionResponse = await fetch(apiEventsUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mappedPayload),
                cache: "no-store",
            });

            const createSessionPayload = await createSessionResponse.json().catch(() => ({}));
            if (!createSessionResponse.ok) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "Failed to create session in /api_events.",
                        upstream: createSessionPayload,
                    },
                    { status: createSessionResponse.status },
                );
            }

            const response = NextResponse.json(
                {
                    ok: true,
                    message: "Next Best Action session created.",
                    received_payload: {
                        event_type: eventType,
                        customer_name: customerName,
                        customer_phone: customerPhone,
                        customer_email: customerEmail,
                        jeweler_id: jewelerId,
                        jeweler_name: jewelerName,
                    },
                    session_id: createSessionPayload.session_id,
                    session: createSessionPayload.session,
                    totalSessions: createSessionPayload.totalSessions,
                    totalEvents: createSessionPayload.totalEvents,
                },
                { status: 201 },
            );
            response.headers.set("Cache-Control", "no-store, max-age=0");
            return response;
        }

        if (eventType === "jewellery_selected" || eventType === "jewelry_selected" || eventType === "jewelry.selected") {
            const jewelryId = asTrimmedString(body.jewelry_id);
            const jewelryName = asTrimmedString(body.jewelry_name);
            const jewelryCategory = asTrimmedString(body.jewelry_category);
            const price = asOptionalNumber(body.price);
            const imageUrlRaw = asTrimmedString(body.image_url);
            const explicitSessionId = asTrimmedString(body.session_id);

            if (!jewelryId || !jewelryName || !jewelryCategory || price == null || !imageUrlRaw) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "event_type 'jewellery_selected' requires jewelry_id, jewelry_name, jewelry_category, price, and image_url.",
                    },
                    { status: 400 },
                );
            }

            let imageUrl = "";
            try {
                imageUrl = new URL(imageUrlRaw).toString();
            } catch {
                return NextResponse.json({ ok: false, error: "image_url must be a valid URL." }, { status: 400 });
            }

            let sessionId = explicitSessionId;
            if (!sessionId) {
                const sessionsResponse = await fetch(apiEventsUrl, { cache: "no-store" });
                const sessionsPayload = (await sessionsResponse.json().catch(() => ({}))) as {
                    sessions?: Array<{ session_id?: string }>;
                };

                if (!sessionsResponse.ok) {
                    return NextResponse.json(
                        {
                            ok: false,
                            error: "Failed to load sessions from /api_events to infer session_id.",
                            upstream: sessionsPayload,
                        },
                        { status: sessionsResponse.status },
                    );
                }

                sessionId = asTrimmedString(sessionsPayload.sessions?.[0]?.session_id);
            }

            if (!sessionId) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "No session found. Start a session first or provide session_id.",
                    },
                    { status: 400 },
                );
            }

            const mappedPayload = {
                event_type: "jewellery_selected",
                session_id: sessionId,
                timestamp: new Date().toISOString(),
                jewellery_id: jewelryId,
                jewelry_id: jewelryId,
                jewelry_name: jewelryName,
                jewelry_category: jewelryCategory,
                price,
                image_url: imageUrl,
            };

            const createEventResponse = await fetch(apiEventsUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mappedPayload),
                cache: "no-store",
            });

            const createEventPayload = await createEventResponse.json().catch(() => ({}));
            if (!createEventResponse.ok) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "Failed to create jewellery_selected event in /api_events.",
                        upstream: createEventPayload,
                    },
                    { status: createEventResponse.status },
                );
            }

            const response = NextResponse.json(
                {
                    ok: true,
                    message: "Jewellery selected event stored.",
                    received_payload: {
                        event_type: "jewellery_selected",
                        jewelry_id: jewelryId,
                        jewelry_name: jewelryName,
                        jewelry_category: jewelryCategory,
                        price,
                        image_url: imageUrl,
                    },
                    session_id: sessionId,
                    event: createEventPayload.event,
                    sessionEventCount: createEventPayload.sessionEventCount,
                    totalEvents: createEventPayload.totalEvents,
                },
                { status: 201 },
            );
            response.headers.set("Cache-Control", "no-store, max-age=0");
            return response;
        }

        if (eventType === "image_generated" || eventType === "image.generated") {
            const jewelryId = asTrimmedString(body.jewelry_id);
            const jewelryName = asTrimmedString(body.jewelry_name);
            const attireId = asTrimmedString(body.attire_id);
            const attireName = asTrimmedString(body.attire_name);
            const imageUrlRaw = asTrimmedString(body.image_url);
            const generationTimeMs = asOptionalNumber(body.generation_time_ms);
            const explicitSessionId = asTrimmedString(body.session_id);

            if (!jewelryId || !jewelryName || !attireId || !attireName || !imageUrlRaw || generationTimeMs == null) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "event_type 'image_generated' requires jewelry_id, jewelry_name, attire_id, attire_name, image_url, and generation_time_ms.",
                    },
                    { status: 400 },
                );
            }

            let imageUrl = "";
            try {
                imageUrl = new URL(imageUrlRaw).toString();
            } catch {
                return NextResponse.json({ ok: false, error: "image_url must be a valid URL." }, { status: 400 });
            }

            let sessionId = explicitSessionId;
            if (!sessionId) {
                const sessionsResponse = await fetch(apiEventsUrl, { cache: "no-store" });
                const sessionsPayload = (await sessionsResponse.json().catch(() => ({}))) as {
                    sessions?: Array<{ session_id?: string }>;
                };

                if (!sessionsResponse.ok) {
                    return NextResponse.json(
                        {
                            ok: false,
                            error: "Failed to load sessions from /api_events to infer session_id.",
                            upstream: sessionsPayload,
                        },
                        { status: sessionsResponse.status },
                    );
                }

                sessionId = asTrimmedString(sessionsPayload.sessions?.[0]?.session_id);
            }

            if (!sessionId) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "No session found. Start a session first or provide session_id.",
                    },
                    { status: 400 },
                );
            }

            const mappedPayload = {
                event_type: "image_generated",
                session_id: sessionId,
                timestamp: new Date().toISOString(),
                jewellery_id: jewelryId,
                jewelry_id: jewelryId,
                jewelry_name: jewelryName,
                attire_id: attireId,
                attire_name: attireName,
                image_url: imageUrl,
                generation_time_ms: generationTimeMs,
            };

            const createEventResponse = await fetch(apiEventsUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mappedPayload),
                cache: "no-store",
            });

            const createEventPayload = await createEventResponse.json().catch(() => ({}));
            if (!createEventResponse.ok) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "Failed to create image_generated event in /api_events.",
                        upstream: createEventPayload,
                    },
                    { status: createEventResponse.status },
                );
            }

            const response = NextResponse.json(
                {
                    ok: true,
                    message: "Image generated event stored.",
                    received_payload: {
                        event_type: "image_generated",
                        jewelry_id: jewelryId,
                        jewelry_name: jewelryName,
                        attire_id: attireId,
                        attire_name: attireName,
                        image_url: imageUrl,
                        generation_time_ms: generationTimeMs,
                    },
                    session_id: sessionId,
                    event: createEventPayload.event,
                    sessionEventCount: createEventPayload.sessionEventCount,
                    totalEvents: createEventPayload.totalEvents,
                },
                { status: 201 },
            );
            response.headers.set("Cache-Control", "no-store, max-age=0");
            return response;
        }

        if (eventType === "image_shared" || eventType === "image.shared") {
            const channel = asTrimmedString(body.channel).toLowerCase();
            const destination = asTrimmedString(body.destination);
            const jewelryId = asTrimmedString(body.jewelry_id);
            const jewelryName = asTrimmedString(body.jewelry_name);
            const jewelerId = asTrimmedString(body.jeweler_id);
            const jewelerName = asTrimmedString(body.jeweler_name);
            const shareStatus = asTrimmedString(body.share_status).toLowerCase();
            const messageSid = asTrimmedString(body.message_sid);
            const imageUrlRaw = asTrimmedString(body.image_url);
            const explicitSessionId = asTrimmedString(body.session_id);

            if (
                !channel ||
                !destination ||
                !jewelryId ||
                !jewelryName ||
                !jewelerId ||
                !jewelerName ||
                !shareStatus ||
                !messageSid ||
                !imageUrlRaw
            ) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "event_type 'image_shared' requires channel, destination, jewelry_id, jewelry_name, jeweler_id, jeweler_name, share_status, message_sid, and image_url.",
                    },
                    { status: 400 },
                );
            }

            let imageUrl = "";
            try {
                imageUrl = new URL(imageUrlRaw).toString();
            } catch {
                return NextResponse.json({ ok: false, error: "image_url must be a valid URL." }, { status: 400 });
            }

            let sessionId = explicitSessionId;
            if (!sessionId) {
                const sessionsResponse = await fetch(apiEventsUrl, { cache: "no-store" });
                const sessionsPayload = (await sessionsResponse.json().catch(() => ({}))) as {
                    sessions?: Array<{ session_id?: string }>;
                };

                if (!sessionsResponse.ok) {
                    return NextResponse.json(
                        {
                            ok: false,
                            error: "Failed to load sessions from /api_events to infer session_id.",
                            upstream: sessionsPayload,
                        },
                        { status: sessionsResponse.status },
                    );
                }

                sessionId = asTrimmedString(sessionsPayload.sessions?.[0]?.session_id);
            }

            if (!sessionId) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "No session found. Start a session first or provide session_id.",
                    },
                    { status: 400 },
                );
            }

            const mappedPayload = {
                event_type: "image_shared",
                session_id: sessionId,
                timestamp: new Date().toISOString(),
                channel,
                destination,
                jewellery_id: jewelryId,
                jewelry_id: jewelryId,
                jewelry_name: jewelryName,
                jeweler_id: jewelerId,
                jeweler_name: jewelerName,
                share_status: shareStatus,
                message_sid: messageSid,
                image_url: imageUrl,
            };

            const createEventResponse = await fetch(apiEventsUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mappedPayload),
                cache: "no-store",
            });

            const createEventPayload = await createEventResponse.json().catch(() => ({}));
            if (!createEventResponse.ok) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "Failed to create image_shared event in /api_events.",
                        upstream: createEventPayload,
                    },
                    { status: createEventResponse.status },
                );
            }

            const response = NextResponse.json(
                {
                    ok: true,
                    message: "Image shared event stored.",
                    received_payload: {
                        event_type: "image_shared",
                        channel,
                        destination,
                        jewelry_id: jewelryId,
                        jewelry_name: jewelryName,
                        jeweler_id: jewelerId,
                        jeweler_name: jewelerName,
                        share_status: shareStatus,
                        message_sid: messageSid,
                        image_url: imageUrl,
                    },
                    session_id: sessionId,
                    event: createEventPayload.event,
                    sessionEventCount: createEventPayload.sessionEventCount,
                    totalEvents: createEventPayload.totalEvents,
                },
                { status: 201 },
            );
            response.headers.set("Cache-Control", "no-store, max-age=0");
            return response;
        }

        if (eventType === "session_ended" || eventType === "session.ended") {
            const durationSeconds = asOptionalNumber(body.duration_seconds);
            const itemsTried = asOptionalNumber(body.items_tried);
            const itemsShared = asOptionalNumber(body.items_shared);
            const saleMade = asOptionalBoolean(body.sale_made);
            const saleAmount = asOptionalNumber(body.sale_amount);
            const purchasedItems = asStringArray(body.purchased_items);
            const notes = asTrimmedString(body.notes);
            const explicitSessionId = asTrimmedString(body.session_id);

            if (
                durationSeconds == null ||
                itemsTried == null ||
                itemsShared == null ||
                saleMade == null ||
                saleAmount == null
            ) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "event_type 'session_ended' requires duration_seconds, items_tried, items_shared, sale_made, and sale_amount.",
                    },
                    { status: 400 },
                );
            }

            if (
                !Number.isInteger(durationSeconds) ||
                durationSeconds < 0 ||
                !Number.isInteger(itemsTried) ||
                itemsTried < 0 ||
                !Number.isInteger(itemsShared) ||
                itemsShared < 0 ||
                saleAmount < 0
            ) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "duration_seconds, items_tried, items_shared must be non-negative integers and sale_amount must be non-negative.",
                    },
                    { status: 400 },
                );
            }

            let sessionId = explicitSessionId;
            if (!sessionId) {
                const sessionsResponse = await fetch(apiEventsUrl, { cache: "no-store" });
                const sessionsPayload = (await sessionsResponse.json().catch(() => ({}))) as {
                    sessions?: Array<{ session_id?: string }>;
                };

                if (!sessionsResponse.ok) {
                    return NextResponse.json(
                        {
                            ok: false,
                            error: "Failed to load sessions from /api_events to infer session_id.",
                            upstream: sessionsPayload,
                        },
                        { status: sessionsResponse.status },
                    );
                }

                sessionId = asTrimmedString(sessionsPayload.sessions?.[0]?.session_id);
            }

            if (!sessionId) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "No session found. Start a session first or provide session_id.",
                    },
                    { status: 400 },
                );
            }

            const sessionSnapshotResponse = await fetch(
                `${apiEventsUrl.toString()}?session_id=${encodeURIComponent(sessionId)}`,
                {
                    cache: "no-store",
                },
            );
            const sessionSnapshotPayload = (await sessionSnapshotResponse.json().catch(() => ({}))) as {
                session?: SessionForSummary;
            };

            const nextBestActionSummary = await generateNextBestActionSummaryWithGrok({
                session: sessionSnapshotResponse.ok ? sessionSnapshotPayload.session || null : null,
                durationSeconds,
                itemsTried,
                itemsShared,
                saleMade,
                saleAmount,
                purchasedItems,
                notes,
            });

            const mappedPayload = {
                event_type: "session_ended",
                session_id: sessionId,
                timestamp: new Date().toISOString(),
                duration_seconds: durationSeconds,
                items_tried: itemsTried,
                items_shared: itemsShared,
                sale_made: saleMade,
                sale_amount: saleAmount,
                purchased_items: purchasedItems,
                notes,
                next_best_action_summary: nextBestActionSummary,
            };

            const createEventResponse = await fetch(apiEventsUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mappedPayload),
                cache: "no-store",
            });

            const createEventPayload = await createEventResponse.json().catch(() => ({}));
            if (!createEventResponse.ok) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "Failed to create session_ended event in /api_events.",
                        upstream: createEventPayload,
                    },
                    { status: createEventResponse.status },
                );
            }

            const response = NextResponse.json(
                {
                    ok: true,
                    message: "Session ended event stored.",
                    received_payload: {
                        event_type: "session_ended",
                        duration_seconds: durationSeconds,
                        items_tried: itemsTried,
                        items_shared: itemsShared,
                        sale_made: saleMade,
                        sale_amount: saleAmount,
                        purchased_items: purchasedItems,
                        notes,
                        next_best_action_summary: nextBestActionSummary,
                    },
                    session_id: sessionId,
                    event: createEventPayload.event,
                    sessionEventCount: createEventPayload.sessionEventCount,
                    totalEvents: createEventPayload.totalEvents,
                },
                { status: 201 },
            );
            response.headers.set("Cache-Control", "no-store, max-age=0");
            return response;
        }

        return NextResponse.json(
            {
                ok: false,
                error: "Unsupported event_type. Supported: session.start, jewellery_selected, image_generated, image_shared, session_ended.",
            },
            { status: 400 },
        );
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            {
                ok: false,
                error: "Failed to process next-best-action session event.",
                details,
            },
            { status: 500 },
        );
    }
}

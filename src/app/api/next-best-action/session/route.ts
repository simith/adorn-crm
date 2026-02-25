import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

        if (eventType === "session_start") {
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
                event_type: "start_session",
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

        if (eventType === "jewellery_selected" || eventType === "jewelry_selected") {
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
                saleAmount == null ||
                purchasedItems.length === 0 ||
                !notes
            ) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "event_type 'session_ended' requires duration_seconds, items_tried, items_shared, sale_made, sale_amount, purchased_items, and notes.",
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
                error: "Unsupported event_type. Supported: session_start, jewellery_selected, image_generated, image_shared, session_ended.",
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

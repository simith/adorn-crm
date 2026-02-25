const nbaSessionEndpoint = process.env.NBA_SESSION_API_URL || "http://localhost:3000/api/next-best-action/session";
const sessionsEndpoint = process.env.NBA_SESSIONS_API_URL || "http://localhost:3000/api_events";

const sessionStartPayload = {
    event_type: "session_start",
    customer_name: "Jane Doe",
    customer_phone: "+6512345678",
    customer_email: "jane@example.com",
    jeweler_id: "abharana",
    jeweler_name: "Abharana",
};

const jewellerySelectedPayload = {
    event_type: "jewellery_selected",
    jewelry_id: "NCK-011",
    jewelry_name: "Diamond Cascade Necklace",
    jewelry_category: "necklace",
    price: 45000.0,
    image_url:
        "https://malabar191.malabargoldanddiamonds.com/media/catalog/product/cache/5/image/500x500/9df78eab33525d08d6e5fb8d27136e95/placeholder/default/placeholder-800x800_2_4.jpg",
};

const imageGeneratedPayload = {
    event_type: "image_generated",
    jewelry_id: "NCK-011",
    jewelry_name: "Diamond Cascade Necklace",
    attire_id: "saree_red_silk",
    attire_name: "Red Silk Saree",
    image_url: "https://i.pinimg.com/564x/35/f1/15/35f115d9b47dc754d251284f734dc226.jpg",
    generation_time_ms: 245,
};

const imageSharedPayload = {
    event_type: "image_shared",
    channel: "whatsapp",
    destination: "+6512345678",
    jewelry_id: "NCK-011",
    jewelry_name: "Diamond Cascade Necklace",
    jeweler_id: "abharana",
    jeweler_name: "Abharana",
    share_status: "sent",
    message_sid: "SM1234567890abcdef",
    image_url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80",
};

const sessionEndedPayload = {
    event_type: "session_ended",
    duration_seconds: 1845,
    items_tried: 8,
    items_shared: 3,
    sale_made: true,
    sale_amount: 125000.0,
    purchased_items: ["NCK-011", "EAR-005"],
    notes: "Customer preferred gold finish",
};

async function postJson(url, body) {
    console.log("Request payload:", JSON.stringify(body, null, 2));

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const rawText = await response.text();
    let payload = {};
    if (rawText) {
        try {
            payload = JSON.parse(rawText);
        } catch {
            payload = { raw_response: rawText.slice(0, 1000) };
        }
    }

    if (!response.ok) {
        throw new Error(`${url} failed: ${response.status} ${JSON.stringify(payload)}`);
    }

    console.log("Response payload:", JSON.stringify(payload, null, 2));
    return payload;
}

async function getJson(url) {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`${url} failed: ${response.status} ${JSON.stringify(payload)}`);
    }

    console.log("Fetched payload:", JSON.stringify(payload, null, 2));
    return payload;
}

function sameStringArray(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
        return false;
    }

    return left.every((entry, index) => entry === right[index]);
}

function hasEvent(events, predicate) {
    return [...events].reverse().find(predicate);
}

async function postJsonWithRetry(url, body, maxAttempts = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await postJson(url, body);
        } catch (error) {
            lastError = error;
            if (attempt >= maxAttempts) {
                throw error;
            }

            const waitMs = 250 * attempt;
            console.warn(`Attempt ${attempt} failed for ${body.event_type}. Retrying in ${waitMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
    }

    throw lastError;
}

async function main() {
    console.log(`Creating session via ${nbaSessionEndpoint}`);
    const startResponse = await postJson(nbaSessionEndpoint, sessionStartPayload);
    const sessionId = startResponse?.session_id;
    if (!sessionId) {
        throw new Error(`session_id missing in start response: ${JSON.stringify(startResponse)}`);
    }

    const eventPayloads = [jewellerySelectedPayload, imageGeneratedPayload, imageSharedPayload, sessionEndedPayload];

    for (const payload of eventPayloads) {
        console.log(`Posting ${payload.event_type} payload via ${nbaSessionEndpoint}`);
        const eventResponse = await postJsonWithRetry(nbaSessionEndpoint, {
            ...payload,
            session_id: sessionId,
        });
        if (!eventResponse?.ok) {
            throw new Error(`Event API did not return ok=true: ${JSON.stringify(eventResponse)}`);
        }
    }

    const sessionResponse = await getJson(`${sessionsEndpoint}?session_id=${encodeURIComponent(sessionId)}`);
    const events = Array.isArray(sessionResponse?.session?.events) ? sessionResponse.session.events : [];

    const checks = [
        {
            label: "jewellery_selected",
            matched: hasEvent(
                events,
                (event) =>
                    event?.event_type === "jewellery_selected" &&
                    event?.jewellery_id === jewellerySelectedPayload.jewelry_id &&
                    event?.jewelry_name === jewellerySelectedPayload.jewelry_name &&
                    event?.jewelry_category === jewellerySelectedPayload.jewelry_category &&
                    Number(event?.price) === jewellerySelectedPayload.price &&
                    event?.image_url === jewellerySelectedPayload.image_url,
            ),
        },
        {
            label: "image_generated",
            matched: hasEvent(
                events,
                (event) =>
                    event?.event_type === "image_generated" &&
                    event?.jewellery_id === imageGeneratedPayload.jewelry_id &&
                    event?.jewelry_name === imageGeneratedPayload.jewelry_name &&
                    event?.attire_id === imageGeneratedPayload.attire_id &&
                    event?.attire_name === imageGeneratedPayload.attire_name &&
                    event?.image_url === imageGeneratedPayload.image_url &&
                    Number(event?.generation_time_ms) === imageGeneratedPayload.generation_time_ms,
            ),
        },
        {
            label: "image_shared",
            matched: hasEvent(
                events,
                (event) =>
                    event?.event_type === "image_shared" &&
                    event?.channel === imageSharedPayload.channel &&
                    event?.destination === imageSharedPayload.destination &&
                    event?.jewellery_id === imageSharedPayload.jewelry_id &&
                    event?.jewelry_name === imageSharedPayload.jewelry_name &&
                    event?.jeweler_id === imageSharedPayload.jeweler_id &&
                    event?.jeweler_name === imageSharedPayload.jeweler_name &&
                    event?.share_status === imageSharedPayload.share_status &&
                    event?.message_sid === imageSharedPayload.message_sid &&
                    event?.image_url === imageSharedPayload.image_url,
            ),
        },
        {
            label: "session_ended",
            matched: hasEvent(
                events,
                (event) =>
                    event?.event_type === "session_ended" &&
                    Number(event?.duration_seconds) === sessionEndedPayload.duration_seconds &&
                    Number(event?.items_tried) === sessionEndedPayload.items_tried &&
                    Number(event?.items_shared) === sessionEndedPayload.items_shared &&
                    event?.sale_made === sessionEndedPayload.sale_made &&
                    Number(event?.sale_amount) === sessionEndedPayload.sale_amount &&
                    sameStringArray(event?.purchased_items, sessionEndedPayload.purchased_items) &&
                    event?.notes === sessionEndedPayload.notes &&
                    typeof event?.next_best_action_summary === "string" &&
                    event.next_best_action_summary.trim().length > 0,
            ),
        },
    ];

    const failedCheck = checks.find((check) => !check.matched);
    if (failedCheck) {
        throw new Error(
            `Expected ${failedCheck.label} event not found for session ${sessionId}. Last events: ${JSON.stringify(events.slice(-8))}`,
        );
    }

    const eventTypesInOrder = events.map((event) => event?.event_type);
    const expectedSequence = [
        "start_session",
        "jewellery_selected",
        "image_generated",
        "image_shared",
        "session_ended",
    ];
    const missing = expectedSequence.filter((eventType) => !eventTypesInOrder.includes(eventType));
    if (missing.length > 0) {
        throw new Error(
            `Missing expected event sequence elements for session ${sessionId}: ${missing.join(", ")}. Seen: ${JSON.stringify(eventTypesInOrder)}`,
        );
    }

    console.log("Verified full flow events for session:", sessionId);
    console.log("Verified sequence:", expectedSequence.join(" -> "));
    console.log(
        "Open /next-best-action and refresh. You should see Jewellery Selected, Image Generated, Image Shared, and Session Ended in the timeline.",
    );
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

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

const sessionEndedPayload = {
    event_type: "session_ended",
    duration_seconds: 1845,
    items_tried: 8,
    items_shared: 3,
    sale_made: true,
    sale_amount: 125000.0,
    purchased_items: ["necklace_11", "earring_05"],
    notes: "Customer preferred gold finish",
};

async function postJson(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`${url} failed: ${response.status} ${JSON.stringify(payload)}`);
    }

    return payload;
}

async function getJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`${url} failed: ${response.status} ${JSON.stringify(payload)}`);
    }

    return payload;
}

function sameStringArray(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
        return false;
    }

    return left.every((entry, index) => entry === right[index]);
}

function hasExpectedEventShape(event) {
    return (
        event?.event_type === "session_ended" &&
        Number(event?.duration_seconds) === sessionEndedPayload.duration_seconds &&
        Number(event?.items_tried) === sessionEndedPayload.items_tried &&
        Number(event?.items_shared) === sessionEndedPayload.items_shared &&
        event?.sale_made === sessionEndedPayload.sale_made &&
        Number(event?.sale_amount) === sessionEndedPayload.sale_amount &&
        sameStringArray(event?.purchased_items, sessionEndedPayload.purchased_items) &&
        event?.notes === sessionEndedPayload.notes
    );
}

async function main() {
    console.log(`Creating session via ${nbaSessionEndpoint}`);
    const startResponse = await postJson(nbaSessionEndpoint, sessionStartPayload);
    const sessionId = startResponse?.session_id;
    if (!sessionId) {
        throw new Error(`session_id missing in start response: ${JSON.stringify(startResponse)}`);
    }

    console.log(`Posting session_ended payload via ${nbaSessionEndpoint}`);
    const eventResponse = await postJson(nbaSessionEndpoint, {
        ...sessionEndedPayload,
        session_id: sessionId,
    });
    if (!eventResponse?.ok) {
        throw new Error(`Event API did not return ok=true: ${JSON.stringify(eventResponse)}`);
    }

    const sessionResponse = await getJson(`${sessionsEndpoint}?session_id=${encodeURIComponent(sessionId)}`);
    const events = Array.isArray(sessionResponse?.session?.events) ? sessionResponse.session.events : [];
    const matched = [...events].reverse().find(hasExpectedEventShape);

    if (!matched) {
        throw new Error(
            `Expected session_ended event not found for session ${sessionId}. Last events: ${JSON.stringify(events.slice(-5))}`,
        );
    }

    console.log("Verified session_ended event:", matched);
    console.log("Open /next-best-action and refresh. The event should appear as 'Session Ended'.");
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

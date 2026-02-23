const endpoint = process.env.EVENTS_API_URL || "https://unblenchingly-unoverdrawn-lea.ngrok-free.dev/api_events";
const eventsCount = Number(process.env.EVENTS_COUNT || 5);
const isNgrok = endpoint.includes("ngrok-free.dev") || endpoint.includes("ngrok.io");

const suffix = String(Date.now()).slice(-6);
const userName = process.env.USER_NAME || `New User ${suffix}`;
const emailId = process.env.EMAIL_ID || `new.user.${suffix}@example.com`;
const mobNumber = process.env.MOB_NUMBER || `98${suffix.padStart(8, "0").slice(0, 8)}`;

const eventTypes = ["view", "wishlist", "add_to_cart", "share", "purchase"];

async function postJson(payload) {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(isNgrok ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`${response.status} ${JSON.stringify(body)}`);
    }

    return body;
}

function buildSessionEvent(sessionId, index, startedAtMs) {
    const timestamp = new Date(startedAtMs + (index + 1) * 60_000).toISOString();
    const event = {
        session_id: sessionId,
        event_type: eventTypes[index % eventTypes.length],
        timestamp,
    };

    if (event.event_type === "view" || event.event_type === "add_to_cart" || event.event_type === "purchase") {
        event.jewellery_id = `JW-${2000 + index}`;
    }

    return event;
}

async function main() {
    const startedAtMs = Date.now();

    console.log(`Starting session for ${userName} via ${endpoint}`);
    const startResponse = await postJson({
        event_type: "start_session",
        user_name: userName,
        email_id: emailId,
        mob_number: mobNumber,
        timestamp: new Date(startedAtMs).toISOString(),
    });

    const sessionId = startResponse.session_id;
    if (!sessionId) {
        throw new Error(`Missing session_id in start_session response: ${JSON.stringify(startResponse)}`);
    }

    console.log(`Session created: ${sessionId}`);

    for (let i = 0; i < eventsCount; i += 1) {
        const eventPayload = buildSessionEvent(sessionId, i, startedAtMs);
        const response = await postJson(eventPayload);
        console.log(`[event ${i + 1}]`, response.event.event_type, response.event.timestamp);
    }

    const verifyResponse = await fetch(`${endpoint}?session_id=${encodeURIComponent(sessionId)}`, {
        headers: isNgrok ? { "ngrok-skip-browser-warning": "true" } : undefined,
    });
    const verifyPayload = await verifyResponse.json().catch(() => null);

    if (verifyResponse.ok && verifyPayload?.session) {
        console.log(`Done. Session ${sessionId} now has ${verifyPayload.session.events.length} events.`);
    } else {
        console.log(`Done. Could not verify session ${sessionId} via GET endpoint.`);
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

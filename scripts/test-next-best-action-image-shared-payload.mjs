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

const imageSharedPayload = {
    event_type: "image_shared",
    channel: "whatsapp",
    destination: "+6512345678",
    jewelry_id: "necklace_11",
    jewelry_name: "Diamond Cascade Necklace",
    jeweler_id: "abharana",
    jeweler_name: "Abharana",
    share_status: "sent",
    message_sid: "SM1234567890abcdef",
    image_url: "https://i.pinimg.com/564x/35/f1/15/35f115d9b47dc754d251284f734dc226.jpg",
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

    const payload = await response.json().catch(() => ({}));
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

function hasExpectedEventShape(event) {
    return (
        event?.event_type === "image_shared" &&
        event?.channel === imageSharedPayload.channel &&
        event?.destination === imageSharedPayload.destination &&
        event?.jewellery_id === imageSharedPayload.jewelry_id &&
        event?.jewelry_name === imageSharedPayload.jewelry_name &&
        event?.jeweler_id === imageSharedPayload.jeweler_id &&
        event?.jeweler_name === imageSharedPayload.jeweler_name &&
        event?.share_status === imageSharedPayload.share_status &&
        event?.message_sid === imageSharedPayload.message_sid &&
        event?.image_url === imageSharedPayload.image_url
    );
}

async function main() {
    console.log(`Creating session via ${nbaSessionEndpoint}`);
    const startResponse = await postJson(nbaSessionEndpoint, sessionStartPayload);
    const sessionId = startResponse?.session_id;
    if (!sessionId) {
        throw new Error(`session_id missing in start response: ${JSON.stringify(startResponse)}`);
    }

    console.log(`Posting image_shared payload via ${nbaSessionEndpoint}`);
    const eventResponse = await postJson(nbaSessionEndpoint, {
        ...imageSharedPayload,
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
            `Expected image_shared event not found for session ${sessionId}. Last events: ${JSON.stringify(events.slice(-5))}`,
        );
    }

    console.log("Verified image_shared event:", matched);
    console.log(
        "Open /next-best-action and refresh. The event should appear as 'Image Shared' with WhatsApp indicator.",
    );
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

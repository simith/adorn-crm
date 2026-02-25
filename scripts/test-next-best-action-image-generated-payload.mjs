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

const imageGeneratedPayload = {
    event_type: "image_generated",
    jewelry_id: "NCK-011",
    jewelry_name: "Diamond Cascade Necklace",
    attire_id: "saree_red_silk",
    attire_name: "Red Silk Saree",
    image_url: "https://i.pinimg.com/564x/35/f1/15/35f115d9b47dc754d251284f734dc226.jpg",
    generation_time_ms: 245,
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

function hasExpectedEventShape(event) {
    return (
        event?.event_type === "image_generated" &&
        event?.jewellery_id === imageGeneratedPayload.jewelry_id &&
        event?.jewelry_name === imageGeneratedPayload.jewelry_name &&
        event?.attire_id === imageGeneratedPayload.attire_id &&
        event?.attire_name === imageGeneratedPayload.attire_name &&
        event?.image_url === imageGeneratedPayload.image_url &&
        Number(event?.generation_time_ms) === imageGeneratedPayload.generation_time_ms
    );
}

async function main() {
    console.log(`Creating session via ${nbaSessionEndpoint}`);
    const startResponse = await postJson(nbaSessionEndpoint, sessionStartPayload);
    const sessionId = startResponse?.session_id;
    if (!sessionId) {
        throw new Error(`session_id missing in start response: ${JSON.stringify(startResponse)}`);
    }

    console.log(`Posting image_generated payload via ${nbaSessionEndpoint}`);
    const eventResponse = await postJson(nbaSessionEndpoint, imageGeneratedPayload);
    if (!eventResponse?.ok) {
        throw new Error(`Event API did not return ok=true: ${JSON.stringify(eventResponse)}`);
    }

    const sessionResponse = await getJson(`${sessionsEndpoint}?session_id=${encodeURIComponent(sessionId)}`);
    const events = Array.isArray(sessionResponse?.session?.events) ? sessionResponse.session.events : [];
    const matched = [...events].reverse().find(hasExpectedEventShape);

    if (!matched) {
        throw new Error(
            `Expected image_generated event not found for session ${sessionId}. Last events: ${JSON.stringify(events.slice(-5))}`,
        );
    }

    console.log("Verified image_generated event:", matched);
    console.log("Open /next-best-action and refresh. The event should appear as 'Image Generated' with thumbnail.");
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

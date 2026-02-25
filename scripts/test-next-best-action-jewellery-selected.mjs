const nbaSessionEndpoint = process.env.NBA_SESSION_API_URL || "http://localhost:3000/api/next-best-action/session";
const sessionsEndpoint = process.env.NBA_SESSIONS_API_URL || "http://localhost:3000/api_events";

const sessionStartPayload = {
    event_type: "session_start",
    customer_name: process.env.CUSTOMER_NAME || "Jane Doe",
    customer_phone: process.env.CUSTOMER_PHONE || "+6512345678",
    customer_email: process.env.CUSTOMER_EMAIL || "jane@example.com",
    jeweler_id: process.env.JEWELER_ID || "abharana",
    jeweler_name: process.env.JEWELER_NAME || "Abharana",
};

const jewellerySelectedPayload = {
    event_type: "jewellery_selected",
    jewelry_id: process.env.JEWELRY_ID || "NCK-011",
    jewelry_name: process.env.JEWELRY_NAME || "Diamond Cascade Necklace",
    jewelry_category: process.env.JEWELRY_CATEGORY || "necklace",
    price: Number(process.env.JEWELRY_PRICE || "45000"),
    image_url:
        process.env.JEWELRY_IMAGE_URL ||
        "https://malabar191.malabargoldanddiamonds.com/media/catalog/product/cache/5/image/500x500/9df78eab33525d08d6e5fb8d27136e95/placeholder/default/placeholder-800x800_2_4.jpg",
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

async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`${url} failed: ${response.status} ${JSON.stringify(payload)}`);
    }

    return payload;
}

async function verifySelectedEvent(sessionId) {
    const sessionPayload = await fetchJson(`${sessionsEndpoint}?session_id=${encodeURIComponent(sessionId)}`);
    const events = Array.isArray(sessionPayload?.session?.events) ? sessionPayload.session.events : [];

    const matched = [...events]
        .reverse()
        .find(
            (event) =>
                event?.event_type === "jewellery_selected" &&
                event?.jewellery_id === jewellerySelectedPayload.jewelry_id &&
                event?.jewelry_name === jewellerySelectedPayload.jewelry_name &&
                event?.image_url === jewellerySelectedPayload.image_url,
        );

    if (!matched) {
        const lastFive = events.slice(-5);
        throw new Error(
            `Could not find jewellery_selected event in session ${sessionId}. Last 5 events: ${JSON.stringify(lastFive)}`,
        );
    }

    return matched;
}

async function main() {
    console.log(`Creating session via ${nbaSessionEndpoint}`);
    const sessionResponse = await postJson(nbaSessionEndpoint, sessionStartPayload);
    const sessionId = sessionResponse?.session_id;

    if (!sessionId) {
        throw new Error(`Session ID missing in response: ${JSON.stringify(sessionResponse)}`);
    }

    console.log(`Created session ${sessionId}. Posting jewellery_selected event...`);
    const selectedResponse = await postJson(nbaSessionEndpoint, jewellerySelectedPayload);
    console.log("Event response:", selectedResponse);

    const matchedEvent = await verifySelectedEvent(sessionId);
    console.log("Verified event:", matchedEvent);
    console.log("Open /next-best-action and refresh. You should see 'Jewellery Selected' with a thumbnail.");
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

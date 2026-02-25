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
        event?.event_type === "jewellery_selected" &&
        event?.jewellery_id === jewellerySelectedPayload.jewelry_id &&
        event?.jewelry_name === jewellerySelectedPayload.jewelry_name &&
        event?.jewelry_category === jewellerySelectedPayload.jewelry_category &&
        Number(event?.price) === jewellerySelectedPayload.price &&
        event?.image_url === jewellerySelectedPayload.image_url
    );
}

async function main() {
    console.log(`Creating session via ${nbaSessionEndpoint}`);
    const startResponse = await postJson(nbaSessionEndpoint, sessionStartPayload);
    const sessionId = startResponse?.session_id;
    if (!sessionId) {
        throw new Error(`session_id missing in start response: ${JSON.stringify(startResponse)}`);
    }

    console.log(`Posting jewellery_selected payload via ${nbaSessionEndpoint}`);
    const eventResponse = await postJson(nbaSessionEndpoint, jewellerySelectedPayload);
    if (!eventResponse?.ok) {
        throw new Error(`Event API did not return ok=true: ${JSON.stringify(eventResponse)}`);
    }

    const sessionResponse = await getJson(`${sessionsEndpoint}?session_id=${encodeURIComponent(sessionId)}`);
    const events = Array.isArray(sessionResponse?.session?.events) ? sessionResponse.session.events : [];
    const matched = [...events].reverse().find(hasExpectedEventShape);

    if (!matched) {
        throw new Error(
            `Expected jewellery_selected event not found for session ${sessionId}. Last events: ${JSON.stringify(events.slice(-5))}`,
        );
    }

    console.log("Verified jewellery_selected event:", matched);
    console.log("Open /next-best-action and refresh. The event should appear as 'Jewellery Selected' with thumbnail.");
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

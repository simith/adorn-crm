const createSessionEndpoint = process.env.NBA_SESSION_API_URL || "http://localhost:3000/api/next-best-action/session";
const sessionsEndpoint = process.env.NBA_SESSIONS_API_URL || "http://localhost:3000/api_events";

const payload = {
    event_type: process.env.EVENT_TYPE || "session_start",
    customer_name: process.env.CUSTOMER_NAME || "Jane Doe",
    customer_phone: process.env.CUSTOMER_PHONE || "+6512345678",
    customer_email: process.env.CUSTOMER_EMAIL || "jane@example.com",
    jeweler_id: process.env.JEWELER_ID || "abharana",
    jeweler_name: process.env.JEWELER_NAME || "Abharana",
};

async function postJson(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`${url} failed: ${response.status} ${JSON.stringify(responseBody)}`);
    }

    return responseBody;
}

async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`${url} failed: ${response.status} ${JSON.stringify(responseBody)}`);
    }

    return responseBody;
}

async function verifySession(sessionId) {
    const verifyUrl = `${sessionsEndpoint}?session_id=${encodeURIComponent(sessionId)}`;
    const sessionPayload = await fetchJson(verifyUrl);
    const session = sessionPayload?.session;

    if (!session) {
        throw new Error(`Could not load session ${sessionId} from ${verifyUrl}`);
    }

    const expectedName = payload.customer_name.trim();
    const expectedPhone = payload.customer_phone.trim();
    const expectedEmail = payload.customer_email.trim().toLowerCase();

    if (
        String(session.user_name ?? "").trim() !== expectedName ||
        String(session.mob_number ?? "").trim() !== expectedPhone ||
        String(session.email_id ?? "")
            .trim()
            .toLowerCase() !== expectedEmail
    ) {
        throw new Error(
            `Session data mismatch. Expected {name: '${expectedName}', phone: '${expectedPhone}', email: '${expectedEmail}'} got ${JSON.stringify(session)}`,
        );
    }

    return session;
}

async function main() {
    console.log(`Creating Next Best Action session via ${createSessionEndpoint}`);
    console.log("Payload:", payload);

    const createResponse = await postJson(createSessionEndpoint, payload);
    console.log("Create response:", createResponse);

    const sessionId = createResponse?.session_id;
    if (!sessionId) {
        throw new Error(`session_id missing in API response: ${JSON.stringify(createResponse)}`);
    }

    const session = await verifySession(sessionId);
    console.log(`Verified session ${sessionId} exists in /api_events.`);
    console.log("Verified user:", {
        user_name: session.user_name,
        email_id: session.email_id,
        mob_number: session.mob_number,
    });
    console.log("Open /next-best-action and refresh to see the new user under Users.");
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

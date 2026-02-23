const endpoint = process.env.EVENTS_API_URL || "http://localhost:3000/api_events";
const sessionCount = Number(process.env.SESSION_COUNT || 3);
const eventsPerSession = Number(process.env.EVENTS_PER_SESSION || 4);
const isNgrok = endpoint.includes("ngrok-free.dev") || endpoint.includes("ngrok.io");

const eventTypes = ["view", "add_to_cart", "wishlist", "purchase", "share"];
const users = [
    { user_name: "Aarav Menon", email_id: "aarav@example.com", mob_number: "9876500001" },
    { user_name: "Nisha Iyer", email_id: "nisha@example.com", mob_number: "9876500002" },
    { user_name: "Rohan Patel", email_id: "rohan@example.com", mob_number: "9876500003" },
    { user_name: "Kavya Rao", email_id: "kavya@example.com", mob_number: "9876500004" },
    { user_name: "Saanvi Shah", email_id: "saanvi@example.com", mob_number: "9876500005" },
];

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

function eventForSession(sessionId, index, startTime) {
    const timestamp = new Date(startTime + (index + 1) * 60_000).toISOString();
    const event = {
        session_id: sessionId,
        event_type: eventTypes[index % eventTypes.length],
        timestamp,
    };

    if (index % 2 === 0) {
        event.jewellery_id = `JW-${1200 + index}`;
    }

    return event;
}

async function createSession(user, index) {
    const startTime = Date.now() - index * 30 * 60_000;
    const payload = {
        event_type: "start_session",
        user_name: user.user_name,
        email_id: user.email_id,
        mob_number: user.mob_number,
        timestamp: new Date(startTime).toISOString(),
    };

    const response = await postJson(payload);
    return { session_id: response.session_id, startTime };
}

async function main() {
    console.log(`Creating ${sessionCount} sessions at ${endpoint}`);

    const sessions = [];
    for (let i = 0; i < sessionCount; i += 1) {
        const user = users[i % users.length];
        const session = await createSession(user, i);
        sessions.push(session);
        console.log(`[session ${i + 1}] started`, session.session_id, "for", user.user_name);
    }

    for (let i = 0; i < sessions.length; i += 1) {
        const { session_id: sessionId, startTime } = sessions[i];
        for (let j = 0; j < eventsPerSession; j += 1) {
            const event = eventForSession(sessionId, j, startTime);
            const response = await postJson(event);
            console.log(`[session ${i + 1} event ${j + 1}] stored`, response.event.event_type);
        }
    }

    const verifyResponse = await fetch(endpoint, {
        headers: isNgrok ? { "ngrok-skip-browser-warning": "true" } : undefined,
    });
    const verifyPayload = await verifyResponse.json().catch(() => null);

    if (verifyResponse.ok && verifyPayload) {
        console.log(
            `Done. API currently has ${verifyPayload.totalSessions} sessions and ${verifyPayload.totalEvents} events.`
        );
    } else {
        console.log("Done. Could not verify current sessions via GET endpoint.");
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

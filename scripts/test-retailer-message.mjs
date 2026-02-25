const retailerEndpoint = process.env.MESSAGES_RETAILER_API_URL || "http://localhost:3000/messages/retailer";
const incomingEndpoint = process.env.MESSAGES_INCOMING_API_URL || "http://localhost:3000/messages/incoming";
const chatEndpoint = process.env.CHAT_API_URL || "http://localhost:3000/api/chat";
const userId = process.env.USER_ID || "cust_rajesh_001";
const questionText =
    process.env.CUSTOMER_QUESTION || "Is this jewellery set available in rose gold and what is the final price?";
const retailerReply =
    process.env.RETAILER_REPLY ||
    "Yes, it is available in rose gold. Final offer price is Rs 72,250 and we can dispatch today.";
const sendQuestionFirst = process.env.SEND_QUESTION_FIRST !== "0";

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

async function postCustomerQuestionIfNeeded() {
    if (!sendQuestionFirst) {
        return null;
    }

    return postJson(incomingEndpoint, {
        user_id: userId,
        text: questionText,
    });
}

async function postRetailerReply() {
    return postJson(retailerEndpoint, {
        user_id: userId,
        text: retailerReply,
    });
}

async function verifyRetailerMessage(postResult) {
    const response = await fetch(`${chatEndpoint}?user_id=${encodeURIComponent(userId)}`);
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.chat || !Array.isArray(payload.chat)) {
        throw new Error(`Could not load chat for ${userId}`);
    }

    const expectedMessageId = postResult?.message?.message_id;
    const normalizedReply = retailerReply.trim();

    const byId = expectedMessageId ? payload.chat.find((message) => message?.message_id === expectedMessageId) : null;
    const byContent = payload.chat.find(
        (message) => message?.sender === "business" && String(message?.message ?? "").trim() === normalizedReply,
    );
    const matched = byId || byContent;

    if (!matched || matched.sender !== "business" || String(matched.message ?? "").trim() !== normalizedReply) {
        const lastFive = payload.chat.slice(-5);
        throw new Error(
            `Retailer reply not found in chat. Expected sender='business', text='${normalizedReply}'. Last 5 messages: ${JSON.stringify(lastFive)}`,
        );
    }

    return {
        totalMessages: payload.chat.length,
        matchedMessage: matched,
    };
}

async function main() {
    console.log(`Retailer endpoint: ${retailerEndpoint}`);
    console.log(`Chat verify endpoint: ${chatEndpoint}?user_id=${encodeURIComponent(userId)}`);

    if (sendQuestionFirst) {
        console.log(`Posting customer question to ${incomingEndpoint}`);
        const questionResult = await postCustomerQuestionIfNeeded();
        console.log("Customer question accepted:", questionResult);
    } else {
        console.log("Skipping customer question pre-step (SEND_QUESTION_FIRST=0).");
    }

    console.log("Posting retailer reply...");
    const retailerResult = await postRetailerReply();
    console.log("Retailer reply accepted:", retailerResult);

    const verified = await verifyRetailerMessage(retailerResult);
    console.log(`Verified retailer reply for user ${userId}. Total messages: ${verified.totalMessages}`);
    console.log("Matched message:", verified.matchedMessage);
    console.log("Refresh /apps/chat to view the retailer response.");
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

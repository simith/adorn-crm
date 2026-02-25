const incomingEndpoint = process.env.MESSAGES_INCOMING_API_URL || "http://localhost:3000/messages/incoming";
const chatEndpoint = process.env.CHAT_API_URL || "http://localhost:3000/api/chat";
const userId = process.env.USER_ID || "cust_rajesh_001";
const text = process.env.MESSAGE_TEXT || "Sharing this necklace design. Do you have this in stock?";
const imageUrl =
    process.env.IMAGE_URL ||
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80";

function normalizeUrl(value) {
    if (!value) return "";
    try {
        return new URL(value).toString();
    } catch {
        return String(value).trim();
    }
}

async function postIncomingMessage() {
    const response = await fetch(incomingEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
            text,
            image_url: imageUrl,
        }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`Incoming API failed: ${response.status} ${JSON.stringify(payload)}`);
    }

    return payload;
}

async function verifyMessage(postResult) {
    const response = await fetch(`${chatEndpoint}?user_id=${encodeURIComponent(userId)}`);
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.chat || !Array.isArray(payload.chat)) {
        throw new Error(`Could not verify chat for ${userId}`);
    }

    const expectedText = String(text).trim();
    const expectedImageUrl = normalizeUrl(imageUrl);
    const latestMessage = payload.chat[payload.chat.length - 1];

    const hasMatchingContent = (message) =>
        message &&
        String(message.message ?? "").trim() === expectedText &&
        normalizeUrl(message.image_url) === expectedImageUrl;

    const expectedMessageId = postResult?.message?.message_id;
    const matchedById = expectedMessageId
        ? payload.chat.find((message) => message?.message_id === expectedMessageId)
        : null;
    const matchedMessage = matchedById || payload.chat.find(hasMatchingContent);
    if (!matchedMessage || !hasMatchingContent(matchedMessage)) {
        const lastThree = payload.chat.slice(-3);
        throw new Error(
            `Posted message not found in chat. Expected text='${expectedText}', image_url='${expectedImageUrl}'. Last 3 messages: ${JSON.stringify(lastThree)}`,
        );
    }

    return {
        totalMessages: payload.chat.length,
        lastMessage: latestMessage,
    };
}

async function main() {
    console.log(`Posting incoming message to ${incomingEndpoint}`);
    console.log(`Verifying chat from ${chatEndpoint}?user_id=${encodeURIComponent(userId)}`);
    const postResult = await postIncomingMessage();
    console.log("Incoming message accepted:", postResult);

    const verified = await verifyMessage(postResult);
    console.log(`Verified chat ${userId}. Total messages: ${verified.totalMessages}`);
    console.log("Latest message:", verified.lastMessage);
    console.log("Open /apps/chat and refresh to view the new image message.");
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

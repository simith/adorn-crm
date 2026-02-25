import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type ChatSender = "customer" | "business";

export type ChatApiMessage = {
    message_id?: string;
    sender: ChatSender;
    message: string;
    time: string;
    image_url?: string;
};

export type ChatApiPayload = {
    campaign: { name: string; title: string; image_link: string };
    customer: { user_id: string; name: string; phone: string; last_seen: string; avatar?: string };
    chat: ChatApiMessage[];
    campaign_stats: { responses: number; views: number; sent: number; status: string };
};

type ChatStoreRecord = {
    payload: ChatApiPayload;
    updatedAt: number;
};

type PersistedChatStore = {
    version: number;
    chats: ChatStoreRecord[];
};

type AppendIncomingMessageInput = {
    userId: string;
    text?: string;
    imageUrl?: string;
};

type AppendRetailerMessageInput = {
    userId: string;
    text?: string;
    imageUrl?: string;
};

const STORE_VERSION = 1;
const CACHE_DIR_PATH = path.join(process.cwd(), "cache");
const CACHE_FILE_PATH = path.join(CACHE_DIR_PATH, "chat-store.json");

export const DEFAULT_CHAT_USER_ID = "cust_rajesh_001";

const DEFAULT_CHAT: ChatApiPayload = {
    campaign: {
        name: "Diwali Jewellery Campaign",
        title: "Elegance That Dazzles",
        image_link: "/images/jewellery/100.jpg",
    },
    customer: {
        user_id: DEFAULT_CHAT_USER_ID,
        name: "Rajesh Sharma",
        phone: "+91 98765 32109",
        last_seen: "just now",
        avatar: "/images/avatars/3.png",
    },
    chat: [
        {
            sender: "customer",
            message: "Hi, what is the price of this jewellery set?",
            time: "3 minutes ago",
        },
        {
            sender: "business",
            message: "Hello Rajesh, thank you for your interest in our jewellery set.",
            time: "9 minutes ago",
        },
        {
            sender: "business",
            message: "The price of this exclusive jewellery set is Rs 85,000.",
            time: "just now",
        },
        {
            sender: "business",
            message: "We have a special offer right now: 15% off, making it Rs 72,250.",
            time: "just now",
        },
        {
            sender: "customer",
            message: "Great, that's a good offer. Is the set available for immediate delivery?",
            time: "3 minutes ago",
        },
    ],
    campaign_stats: {
        responses: 4,
        views: 5720,
        sent: 9452,
        status: "Best Ag30",
    },
};

function cloneChat(chat: ChatApiPayload): ChatApiPayload {
    return JSON.parse(JSON.stringify(chat)) as ChatApiPayload;
}

function cloneStore(store: PersistedChatStore): PersistedChatStore {
    return JSON.parse(JSON.stringify(store)) as PersistedChatStore;
}

function currentTimeLabel() {
    return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function createDefaultStore(): PersistedChatStore {
    return {
        version: STORE_VERSION,
        chats: [
            {
                payload: cloneChat(DEFAULT_CHAT),
                updatedAt: Date.now(),
            },
        ],
    };
}

function isChatRecord(value: unknown): value is ChatStoreRecord {
    if (!value || typeof value !== "object") {
        return false;
    }

    const record = value as Partial<ChatStoreRecord>;
    return Boolean(record.payload && typeof record.updatedAt === "number");
}

function normalizeStore(payload: unknown): PersistedChatStore {
    if (!payload || typeof payload !== "object") {
        return createDefaultStore();
    }

    const raw = payload as Partial<PersistedChatStore>;
    const chats = Array.isArray(raw.chats) ? raw.chats.filter(isChatRecord) : [];
    if (chats.length === 0) {
        return createDefaultStore();
    }

    return {
        version: STORE_VERSION,
        chats: cloneStore({ version: STORE_VERSION, chats }).chats,
    };
}

async function readStore(): Promise<PersistedChatStore> {
    await mkdir(CACHE_DIR_PATH, { recursive: true });

    try {
        const raw = await readFile(CACHE_FILE_PATH, "utf-8");
        return normalizeStore(JSON.parse(raw));
    } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code !== "ENOENT") {
            console.warn("Failed to read chat store, re-initializing from defaults.", err.message);
        }
        const fallback = createDefaultStore();
        await writeStore(fallback);
        return fallback;
    }
}

async function writeStore(store: PersistedChatStore) {
    await mkdir(CACHE_DIR_PATH, { recursive: true });
    await writeFile(CACHE_FILE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function createChatForUser(userId: string): ChatStoreRecord {
    const payload = cloneChat(DEFAULT_CHAT);
    payload.customer.user_id = userId;
    payload.customer.name = `Customer ${userId}`;
    payload.customer.phone = "-";
    payload.customer.last_seen = "just now";
    payload.chat = [];
    return { payload, updatedAt: Date.now() };
}

export async function getChatByUserId(userId?: string | null) {
    const store = await readStore();
    const requestedUserId = userId?.trim();

    if (requestedUserId) {
        const record = store.chats.find((entry) => entry.payload.customer.user_id === requestedUserId);
        return record ? cloneChat(record.payload) : null;
    }

    if (store.chats.length === 0) {
        return null;
    }

    const newest = [...store.chats].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    return newest ? cloneChat(newest.payload) : null;
}

export async function appendIncomingMessage(input: AppendIncomingMessageInput) {
    return appendMessage({
        userId: input.userId,
        text: input.text,
        imageUrl: input.imageUrl,
        sender: "customer",
    });
}

export async function appendRetailerMessage(input: AppendRetailerMessageInput) {
    return appendMessage({
        userId: input.userId,
        text: input.text,
        imageUrl: input.imageUrl,
        sender: "business",
    });
}

async function appendMessage(input: AppendIncomingMessageInput & { sender: ChatSender }) {
    const userId = input.userId.trim();
    const text = input.text?.trim() || "";
    const store = await readStore();

    let record = store.chats.find((entry) => entry.payload.customer.user_id === userId);
    if (!record) {
        record = createChatForUser(userId);
        store.chats.push(record);
    }

    const nextMessage: ChatApiMessage = {
        message_id: randomUUID(),
        sender: input.sender,
        message: text,
        time: currentTimeLabel(),
    };

    if (input.imageUrl) {
        nextMessage.image_url = input.imageUrl;
    }

    record.payload.chat.push(nextMessage);
    if (input.sender === "customer") {
        record.payload.customer.last_seen = "just now";
        record.payload.campaign_stats.responses += 1;
    } else {
        record.payload.campaign_stats.sent += 1;
    }
    record.updatedAt = Date.now();

    await writeStore(store);

    return cloneChat(record.payload);
}

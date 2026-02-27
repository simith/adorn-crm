import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { supabase } from "@/lib/supabase";

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

const DEFAULT_CHATS: ChatApiPayload[] = [
    {
        campaign: {
            name: "Festive Gold Days",
            title: "Diwali Jewellery Offers",
            image_link: "/images/jewellery/100.jpg",
        },
        customer: {
            user_id: DEFAULT_CHAT_USER_ID,
            name: "Rajesh Sharma",
            phone: "+91 98765 32109",
            last_seen: "2 minutes ago",
            avatar: "/images/avatars/3.png",
        },
        chat: [
            { sender: "customer", message: "Hi, what is the price of this jewellery set?", time: "4:05 PM" },
            {
                sender: "business",
                message: "Hello Rajesh, this necklace set is priced at Rs 85,000.",
                time: "4:06 PM",
            },
            {
                sender: "business",
                message: "For the festive week we have 15% off, so it comes to Rs 72,250.",
                time: "4:07 PM",
            },
            {
                sender: "customer",
                message: "Great, is same-day delivery possible in Bangalore?",
                time: "4:09 PM",
            },
            {
                sender: "business",
                message: "Yes, same-day delivery is available for orders placed before 6 PM.",
                time: "4:10 PM",
            },
        ],
        campaign_stats: {
            responses: 6,
            views: 5720,
            sent: 9452,
            status: "Festive Push",
        },
    },
    {
        campaign: {
            name: "Wedding Collection 2026",
            title: "Diamond Savings Week",
            image_link: "/images/jewellery/101.jpg",
        },
        customer: {
            user_id: "cust_aisha_002",
            name: "Aisha Menon",
            phone: "+91 99004 11220",
            last_seen: "5 minutes ago",
            avatar: "/images/avatars/4.png",
        },
        chat: [
            {
                sender: "customer",
                message: "Can you share the current offer on diamond bangles?",
                time: "3:20 PM",
            },
            {
                sender: "business",
                message: "Sure, we have up to 12% off on making charges this week.",
                time: "3:21 PM",
            },
            {
                sender: "customer",
                message: "What is the approximate price range for bridal pieces?",
                time: "3:22 PM",
            },
            {
                sender: "business",
                message: "Bridal diamond bangles start from Rs 1.25 lakh and go up based on carat and design.",
                time: "3:24 PM",
            },
            {
                sender: "business",
                message: "If you visit this weekend, we can include a free polishing package too.",
                time: "3:24 PM",
            },
        ],
        campaign_stats: {
            responses: 9,
            views: 4310,
            sent: 7130,
            status: "High Intent",
        },
    },
    {
        campaign: {
            name: "Akshaya Tritiya Picks",
            title: "Gold Price Lock Offer",
            image_link: "/images/jewellery/102.jpg",
        },
        customer: {
            user_id: "cust_vikram_003",
            name: "Vikram Rao",
            phone: "+91 98450 78091",
            last_seen: "7 minutes ago",
            avatar: "/images/avatars/5.png",
        },
        chat: [
            {
                sender: "customer",
                message: "I saw the 22K chain in your campaign image. What is the final rate?",
                time: "2:45 PM",
            },
            {
                sender: "business",
                message: "Today gold rate is Rs 6,650 per gram and making is 9%.",
                time: "2:46 PM",
            },
            {
                sender: "customer",
                message: "Any festival coupon available?",
                time: "2:47 PM",
            },
            {
                sender: "business",
                message: "Yes, code FESTIVE5000 gives Rs 5,000 off for bills above Rs 1 lakh.",
                time: "2:49 PM",
            },
        ],
        campaign_stats: {
            responses: 4,
            views: 3900,
            sent: 6200,
            status: "Warm",
        },
    },
    {
        campaign: {
            name: "Onam Special Sets",
            title: "Traditional Gold Offer",
            image_link: "/images/jewellery/best-seller.jpg",
        },
        customer: {
            user_id: "cust_sneha_004",
            name: "Sneha Iyer",
            phone: "+91 97890 44551",
            last_seen: "12 minutes ago",
            avatar: "/images/avatars/6.png",
        },
        chat: [
            {
                sender: "customer",
                message: "Do you have any Onam combo offers on necklace + earrings?",
                time: "1:30 PM",
            },
            {
                sender: "business",
                message: "Yes, combo sets have flat 10% off on making charges and 2% cashback.",
                time: "1:31 PM",
            },
            {
                sender: "customer",
                message: "Can I reserve one set and pick it up tomorrow?",
                time: "1:33 PM",
            },
            {
                sender: "business",
                message: "Absolutely, we can block it for 24 hours with a small token advance.",
                time: "1:34 PM",
            },
        ],
        campaign_stats: {
            responses: 5,
            views: 4870,
            sent: 7000,
            status: "Follow-up",
        },
    },
    {
        campaign: {
            name: "Weekend Price Drop",
            title: "Diamond Necklace Deal",
            image_link: "/images/jewellery/101.jpg",
        },
        customer: {
            user_id: "cust_arjun_005",
            name: "Arjun Nair",
            phone: "+91 98950 55672",
            last_seen: "15 minutes ago",
            avatar: "/images/avatars/7.png",
        },
        chat: [
            {
                sender: "customer",
                message: "What is the offer price for the Diamond Cascade Necklace?",
                time: "12:15 PM",
            },
            {
                sender: "business",
                message: "MRP is Rs 45,000 and weekend offer price is Rs 39,999.",
                time: "12:16 PM",
            },
            {
                sender: "customer",
                message: "Does that include hallmark and certificate?",
                time: "12:16 PM",
            },
            {
                sender: "business",
                message: "Yes, both hallmarking and authenticity certificate are included.",
                time: "12:17 PM",
            },
        ],
        campaign_stats: {
            responses: 7,
            views: 5100,
            sent: 7800,
            status: "Offer Live",
        },
    },
    {
        campaign: {
            name: "Bridal Fest 2026",
            title: "Try-On & Save",
            image_link: "/images/jewellery/102.jpg",
        },
        customer: {
            user_id: "cust_pooja_006",
            name: "Pooja Verma",
            phone: "+91 98110 77302",
            last_seen: "20 minutes ago",
            avatar: "/images/avatars/8.png",
        },
        chat: [
            {
                sender: "customer",
                message: "Can I get bulk discount if I buy necklace and bangles together?",
                time: "11:05 AM",
            },
            {
                sender: "business",
                message: "Yes, for bridal combo purchases above Rs 2 lakh we offer 5% additional discount.",
                time: "11:06 AM",
            },
            {
                sender: "customer",
                message: "Nice. Can you share festive EMI options too?",
                time: "11:08 AM",
            },
            {
                sender: "business",
                message: "No-cost EMI is available for 3 and 6 months through partner banks.",
                time: "11:09 AM",
            },
        ],
        campaign_stats: {
            responses: 8,
            views: 6020,
            sent: 8200,
            status: "Pipeline",
        },
    },
    {
        campaign: {
            name: "Navratri Glam Edit",
            title: "Limited Time Gold Bonus",
            image_link: "/images/jewellery/100.jpg",
        },
        customer: {
            user_id: "cust_karan_007",
            name: "Karan Mehta",
            phone: "+91 99200 66410",
            last_seen: "24 minutes ago",
            avatar: "/images/avatars/9.png",
        },
        chat: [
            {
                sender: "customer",
                message: "Is there any exchange bonus on old gold this Navratri?",
                time: "10:10 AM",
            },
            {
                sender: "business",
                message: "Yes, we are offering 4% extra value on old gold exchange till Sunday.",
                time: "10:11 AM",
            },
            {
                sender: "customer",
                message: "Perfect. Is appointment needed for valuation?",
                time: "10:13 AM",
            },
            {
                sender: "business",
                message: "Walk-ins are welcome, but appointments get priority service.",
                time: "10:14 AM",
            },
        ],
        campaign_stats: {
            responses: 3,
            views: 3500,
            sent: 5900,
            status: "New",
        },
    },
    {
        campaign: {
            name: "Anniversary Specials",
            title: "Diamond Pendant Promo",
            image_link: "/images/jewellery/101.jpg",
        },
        customer: {
            user_id: "cust_meera_008",
            name: "Meera Nambiar",
            phone: "+91 97440 00987",
            last_seen: "28 minutes ago",
            avatar: "/images/avatars/10.png",
        },
        chat: [
            {
                sender: "customer",
                message: "Please confirm the final price for pendant code DP-118.",
                time: "9:25 AM",
            },
            {
                sender: "business",
                message: "DP-118 is Rs 58,500 and today we can offer it at Rs 54,900.",
                time: "9:26 AM",
            },
            {
                sender: "customer",
                message: "Can I combine this with the festive cashback offer?",
                time: "9:27 AM",
            },
            {
                sender: "business",
                message: "Yes, cashback up to Rs 2,000 applies on top of the offer price.",
                time: "9:29 AM",
            },
        ],
        campaign_stats: {
            responses: 6,
            views: 4012,
            sent: 6660,
            status: "Offer Sent",
        },
    },
    {
        campaign: {
            name: "Daily Gold Deals",
            title: "Early Bird Price",
            image_link: "/images/jewellery/102.jpg",
        },
        customer: {
            user_id: "cust_rhea_009",
            name: "Rhea Joseph",
            phone: "+91 99617 10345",
            last_seen: "32 minutes ago",
            avatar: "/images/avatars/1.png",
        },
        chat: [
            {
                sender: "customer",
                message: "Do morning orders get any extra discount?",
                time: "8:40 AM",
            },
            {
                sender: "business",
                message: "Yes, early bird orders before 11 AM get 2% off on making charges.",
                time: "8:41 AM",
            },
            {
                sender: "customer",
                message: "That sounds good. Please hold the floral ring for me.",
                time: "8:43 AM",
            },
            {
                sender: "business",
                message: "Done. We have reserved it in your name until evening.",
                time: "8:44 AM",
            },
        ],
        campaign_stats: {
            responses: 4,
            views: 2875,
            sent: 4900,
            status: "Reserved",
        },
    },
    {
        campaign: {
            name: "Month-End Festive Sale",
            title: "Flat Gold Offer",
            image_link: "/images/jewellery/best-seller.jpg",
        },
        customer: {
            user_id: "cust_fahad_010",
            name: "Fahad Khan",
            phone: "+91 98860 99876",
            last_seen: "36 minutes ago",
            avatar: "/images/avatars/2.png",
        },
        chat: [
            {
                sender: "customer",
                message: "Any month-end festive offer on men's bracelet?",
                time: "8:05 AM",
            },
            {
                sender: "business",
                message: "Yes, flat Rs 3,000 off on selected men's bracelets above Rs 40,000.",
                time: "8:06 AM",
            },
            {
                sender: "customer",
                message: "Can you send one option under Rs 50,000?",
                time: "8:07 AM",
            },
            {
                sender: "business",
                message: "Sure, I have sent a curated option at Rs 47,500 with offer applied.",
                time: "8:08 AM",
            },
        ],
        campaign_stats: {
            responses: 5,
            views: 3200,
            sent: 5400,
            status: "Active",
        },
    },
];

const DEFAULT_CHAT: ChatApiPayload = DEFAULT_CHATS[0];

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
    const baseTime = Date.now();
    return {
        version: STORE_VERSION,
        chats: DEFAULT_CHATS.map((chat, index) => ({
            payload: cloneChat(chat),
            updatedAt: baseTime - index * 60_000,
        })),
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

function withSeededChats(store: PersistedChatStore): PersistedChatStore {
    const byUserId = new Map<string, ChatStoreRecord>();
    for (const record of store.chats) {
        byUserId.set(record.payload.customer.user_id, record);
    }

    const baseTime = Date.now();
    for (const [index, chat] of DEFAULT_CHATS.entries()) {
        if (!byUserId.has(chat.customer.user_id)) {
            byUserId.set(chat.customer.user_id, {
                payload: cloneChat(chat),
                updatedAt: baseTime - index * 60_000,
            });
        }
    }

    return {
        version: STORE_VERSION,
        chats: [...byUserId.values()],
    };
}

async function readStore(): Promise<PersistedChatStore> {
    await mkdir(CACHE_DIR_PATH, { recursive: true });

    try {
        const raw = await readFile(CACHE_FILE_PATH, "utf-8");
        const normalized = normalizeStore(JSON.parse(raw));
        const seeded = withSeededChats(normalized);
        if (seeded.chats.length !== normalized.chats.length) {
            await writeStore(seeded);
        }
        return seeded;
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

export async function getAllChats() {
    const store = await readStore();
    return [...store.chats]
        .sort((a, b) => {
            const aIsDefault = a.payload.customer.user_id === DEFAULT_CHAT_USER_ID;
            const bIsDefault = b.payload.customer.user_id === DEFAULT_CHAT_USER_ID;
            if (aIsDefault !== bIsDefault) {
                return aIsDefault ? -1 : 1;
            }
            return b.updatedAt - a.updatedAt;
        })
        .map((entry) => cloneChat(entry.payload));
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

// --- Supabase dual-write helpers (fire-and-forget) ---

async function persistChatMessageToSupabase(msg: ChatApiMessage & { user_id: string }) {
    try {
        const { error } = await supabase.from("chat_messages").upsert(
            {
                message_id: msg.message_id,
                user_id: msg.user_id,
                sender: msg.sender,
                message: msg.message,
                image_url: msg.image_url || null,
                time_label: msg.time,
            },
            { onConflict: "message_id" },
        );
        if (error) console.warn("[Supabase] chat message upsert failed:", error.message);
    } catch (err) {
        console.warn("[Supabase] chat message upsert error:", err);
    }
}

async function persistChatCustomerToSupabase(payload: ChatApiPayload) {
    try {
        const { customer, campaign, campaign_stats } = payload;
        const { error } = await supabase.from("chat_customers").upsert(
            {
                user_id: customer.user_id,
                name: customer.name,
                phone: customer.phone,
                last_seen: customer.last_seen,
                avatar: customer.avatar || null,
                campaign_name: campaign.name,
                campaign_title: campaign.title,
                campaign_image: campaign.image_link,
                stats_responses: campaign_stats.responses,
                stats_views: campaign_stats.views,
                stats_sent: campaign_stats.sent,
                stats_status: campaign_stats.status,
            },
            { onConflict: "user_id" },
        );
        if (error) console.warn("[Supabase] chat customer upsert failed:", error.message);
    } catch (err) {
        console.warn("[Supabase] chat customer upsert error:", err);
    }
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

    // Dual-write to Supabase (non-blocking)
    persistChatMessageToSupabase({ ...nextMessage, user_id: userId }).then(() =>
        persistChatCustomerToSupabase(record!.payload),
    );

    return cloneChat(record.payload);
}

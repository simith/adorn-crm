"use client";

import { useCallback, useEffect, useState } from "react";

import type { IChatItem } from "./components/ChatItem";
import { ChatList } from "./components/ChatList";
import type { IChatMessageItem } from "./components/ChatMessageItem";
import { ChatMessageList } from "./components/ChatMessageList";

type ChatApiResponse = {
    campaign: { name: string; title: string; image_link: string };
    customer: { user_id: string; name: string; phone: string; last_seen: string; avatar?: string };
    chat: Array<{ sender: string; message: string; time: string; image_url?: string }>;
    campaign_stats: { responses: number; views: number; sent: number; status: string };
};

type ChatListApiResponse = {
    ok: boolean;
    chats?: ChatApiResponse[];
};

function chatIdFromUserId(userId: string) {
    return Array.from(userId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function mapApiChatToItem(data: ChatApiResponse): IChatItem {
    const messages: IChatMessageItem[] = data.chat.map((c) => ({
        message: c.message,
        sendAt: c.time,
        imageUrl: c.image_url,
        sender: c.sender === "customer" ? "other" : "me",
        status: "read",
    }));
    return {
        id: chatIdFromUserId(data.customer.user_id),
        userId: data.customer.user_id,
        image: data.customer.avatar || "/images/avatars/3.png",
        name: data.customer.name,
        messages,
        lastSeen: data.customer.last_seen,
        phone: data.customer.phone,
        campaign: data.campaign,
        campaign_stats: data.campaign_stats,
    };
}

export const ChatApp = () => {
    const [chats, setChats] = useState<IChatItem[]>([]);
    const [selectedChat, setSelectedChat] = useState<IChatItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/chat")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load chat");
                return res.json();
            })
            .then((payload: ChatApiResponse | ChatListApiResponse) => {
                const apiChats = Array.isArray((payload as ChatListApiResponse).chats)
                    ? (payload as ChatListApiResponse).chats || []
                    : ([payload] as ChatApiResponse[]);
                const mapped = apiChats.map(mapApiChatToItem);
                setChats(mapped);
                setSelectedChat(mapped[0] ?? null);
            })
            .catch(() => {
                setChats([]);
                setSelectedChat(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const onSubmit = useCallback(
        (message: string) => {
            if (selectedChat) {
                const next = {
                    ...selectedChat,
                    messages: [
                        ...selectedChat.messages,
                        { message, sendAt: "just now", sender: "me" as const, status: "sent" as const },
                    ],
                };
                setSelectedChat(next);
                setChats((prev) => prev.map((c) => (c.id === selectedChat.id ? next : c)));
            }
        },
        [selectedChat],
    );

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="bg-base-200/60 h-[calc(100vh-200px)] animate-pulse rounded-lg lg:col-span-5 xl:col-span-4 2xl:col-span-3" />
                <div className="bg-base-200/60 h-[calc(100vh-200px)] animate-pulse rounded-lg lg:col-span-7 xl:col-span-8 2xl:col-span-9" />
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="border-base-200 bg-base-100 flex min-h-[40vh] items-center justify-center rounded-lg border">
                <p className="text-base-content/60">Could not load chat.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5 xl:col-span-4 2xl:col-span-3">
                <ChatList chats={chats} selected={selectedChat!} selectChat={setSelectedChat} />
            </div>
            <div className="lg:col-span-7 xl:col-span-8 2xl:col-span-9">
                <ChatMessageList onSendMessage={onSubmit} chat={selectedChat!} />
            </div>
        </div>
    );
};

import { NextResponse } from "next/server";

import { getAllChats, getChatByUserId } from "@/lib/chat-store";

export const dynamic = "force-dynamic";

function withNoStoreHeaders(response: NextResponse) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (userId) {
        const chat = await getChatByUserId(userId);
        if (!chat) {
            return withNoStoreHeaders(NextResponse.json({ ok: false, error: "Chat not found" }, { status: 404 }));
        }

        return withNoStoreHeaders(NextResponse.json(chat));
    }

    const chats = await getAllChats();
    return withNoStoreHeaders(NextResponse.json({ ok: true, chats }));
}

import { NextResponse } from "next/server";

import { getChatByUserId } from "@/lib/chat-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const chat = await getChatByUserId(userId);

    if (!chat) {
        return NextResponse.json(
            { ok: false, error: userId ? `No chat found for user_id '${userId}'` : "No chats found" },
            { status: 404 },
        );
    }

    const response = NextResponse.json(chat);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}

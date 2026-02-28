import { NextResponse } from "next/server";

import { appendIncomingMessage } from "@/lib/chat-store";

export const dynamic = "force-dynamic";

function asTrimmedString(value: unknown) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

function normalizeImageUrl(value: string) {
    if (!value) {
        return undefined;
    }

    if (value.startsWith("public/")) {
        return `/${value.slice("public/".length)}`;
    }

    if (value.startsWith("/")) {
        return value;
    }

    return new URL(value).toString();
}

export async function POST(request: Request) {
    let payload: unknown;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const userId = asTrimmedString(body.user_id);
    const text = asTrimmedString(body.text ?? body.message);
    const imageUrlRaw = asTrimmedString(body.image_url);

    if (!userId) {
        return NextResponse.json({ ok: false, error: "user_id is required" }, { status: 400 });
    }

    if (!text && !imageUrlRaw) {
        return NextResponse.json({ ok: false, error: "Provide at least one of: text, image_url" }, { status: 400 });
    }

    let imageUrl: string | undefined;
    if (imageUrlRaw) {
        try {
            imageUrl = normalizeImageUrl(imageUrlRaw);
        } catch {
            return NextResponse.json({ ok: false, error: "image_url must be a valid URL or public asset path" }, { status: 400 });
        }
    }

    const chat = await appendIncomingMessage({
        userId,
        text,
        imageUrl,
    });

    const latestMessage = chat.chat[chat.chat.length - 1];
    const response = NextResponse.json({
        ok: true,
        user_id: userId,
        message: latestMessage,
        total_messages: chat.chat.length,
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
}

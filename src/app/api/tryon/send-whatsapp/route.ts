import { NextRequest, NextResponse } from "next/server";

import { sendWhatsApp } from "@/lib/twilio";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, customerName, jewelryName, imageUrl } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }
        if (!imageUrl) {
            return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
        }

        console.log(`Sending WhatsApp to ${phoneNumber} - Customer: ${customerName}, Jewelry: ${jewelryName}`);

        const result = await sendWhatsApp(phoneNumber, jewelryName || "Beautiful Jewelry", imageUrl);

        console.log(`WhatsApp sent to ${result.to}: ${result.messageSid}`);

        return NextResponse.json(
            {
                success: true,
                messageSid: result.messageSid,
                status: result.status,
                to: result.to,
            },
            { headers: CORS_HEADERS },
        );
    } catch (error) {
        console.error("WhatsApp send error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to send WhatsApp message" },
            { status: 500 },
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

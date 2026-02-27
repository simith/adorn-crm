import { NextRequest, NextResponse } from "next/server";

import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendWhatsApp } from "@/lib/twilio";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get("content-type") || "";

        let imageData: Buffer;
        let customerName = "Customer";
        let jewelryName = "Jewelry";
        let phoneNumber: string | undefined;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const file = formData.get("image") as File;

            if (!file) {
                return NextResponse.json({ error: "No image provided" }, { status: 400 });
            }

            customerName = (formData.get("customerName") as string) || customerName;
            jewelryName = (formData.get("jewelryName") as string) || jewelryName;
            phoneNumber = (formData.get("phoneNumber") as string) || undefined;

            const bytes = await file.arrayBuffer();
            imageData = Buffer.from(bytes);
        } else if (contentType.includes("application/json")) {
            const json = await request.json();

            if (!json.image) {
                return NextResponse.json({ error: "No image provided" }, { status: 400 });
            }

            customerName = json.customerName || customerName;
            jewelryName = json.jewelryName || jewelryName;
            phoneNumber = json.phoneNumber || undefined;

            const base64Data = json.image.replace(/^data:image\/\w+;base64,/, "");
            imageData = Buffer.from(base64Data, "base64");
        } else {
            return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
        }

        if (!phoneNumber || phoneNumber.trim() === "") {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const filename = `tryon-${id}.jpg`;

        console.log(`Processing try-on for ${customerName} - ${jewelryName} to ${phoneNumber}`);

        // Step 1: Upload to Cloudinary
        let imageUrl: string;
        try {
            imageUrl = await uploadToCloudinary(imageData, filename);
            console.log(`Uploaded to Cloudinary: ${imageUrl}`);
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
        }

        // Step 2: Send via WhatsApp
        let messageSid: string;
        try {
            const result = await sendWhatsApp(phoneNumber, jewelryName, imageUrl);
            messageSid = result.messageSid;
            console.log(`WhatsApp sent: ${messageSid}`);
        } catch (error) {
            console.error("WhatsApp send failed:", error);
            return NextResponse.json(
                { error: `Failed to send WhatsApp: ${error instanceof Error ? error.message : "Unknown error"}` },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                messageSid,
                imageUrl,
                message: "Try-on image sent via WhatsApp",
            },
            { headers: CORS_HEADERS },
        );
    } catch (error) {
        console.error("Send try-on error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

import { NextRequest, NextResponse } from "next/server";

import { getImageDimensions, uploadToCloudinary } from "@/lib/cloudinary";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get("content-type") || "";

        let imageData: Buffer;
        let customerName = "Unknown Customer";
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
            return NextResponse.json(
                { error: "Unsupported content type. Use multipart/form-data or application/json" },
                { status: 400 },
            );
        }

        const dimensions = getImageDimensions(imageData);

        const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const filename = `tryon-${id}.jpg`;

        let publicUrl: string;
        try {
            publicUrl = await uploadToCloudinary(imageData, filename);
            console.log(`Uploaded to Cloudinary: ${publicUrl}`);
        } catch (cloudinaryError) {
            console.error("Cloudinary upload failed:", cloudinaryError);
            return NextResponse.json({ error: "Failed to upload image to cloud storage" }, { status: 500 });
        }

        console.log(
            `Saved image: ${filename} for ${customerName} (${dimensions?.width}x${dimensions?.height}, ${(imageData.length / 1024).toFixed(1)}KB)`,
        );

        return NextResponse.json(
            {
                success: true,
                id,
                url: publicUrl,
                publicUrl,
                customerName,
                jewelryName,
                phoneNumber,
                fileSize: imageData.length,
                width: dimensions?.width,
                height: dimensions?.height,
                message: "Image uploaded successfully",
            },
            { headers: CORS_HEADERS },
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

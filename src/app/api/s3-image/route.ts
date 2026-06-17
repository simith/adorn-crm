import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getS3Client(): S3Client | null {
    const region = process.env.AWS_REGION;
    const key = process.env.AWS_ACCESS_KEY_ID;
    const secret = process.env.AWS_SECRET_ACCESS_KEY;
    if (!region || !key || !secret) return null;
    return new S3Client({ region, credentials: { accessKeyId: key, secretAccessKey: secret } });
}

export async function GET(request: NextRequest) {
    const s3Key = request.nextUrl.searchParams.get("key");
    const bucket = process.env.S3_TRYON_BUCKET;

    if (!s3Key) {
        return NextResponse.json({ error: "key is required" }, { status: 400 });
    }
    if (!bucket) {
        return NextResponse.json({ error: "S3_TRYON_BUCKET not configured" }, { status: 500 });
    }

    const s3 = getS3Client();
    if (!s3) {
        return NextResponse.json({ error: "S3 credentials not configured" }, { status: 500 });
    }

    try {
        const command = new GetObjectCommand({ Bucket: bucket, Key: s3Key });
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return NextResponse.redirect(url);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 404 });
    }
}

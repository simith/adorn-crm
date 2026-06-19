import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getS3Client(): S3Client | null {
    const region = process.env.AWS_REGION;
    const key = process.env.AWS_ACCESS_KEY_ID;
    const secret = process.env.AWS_SECRET_ACCESS_KEY;
    if (!region || !key || !secret) return null;
    return new S3Client({ region, credentials: { accessKeyId: key, secretAccessKey: secret } });
}

export type S3ImageType = "original" | "result" | "adorned" | "unknown";

export type S3Image = {
    key: string;
    type: S3ImageType;
    attireId: string | null;
    sessionTime: string;
    lastModified?: string;
};

export type S3Session = {
    sessionTime: string;
    images: S3Image[];
};

export type S3Customer = {
    email: string;
    sessions: S3Session[];
};

function parseKey(key: string): S3Image | null {
    // Pattern: {date}/{safeEmail}/sessions/{time}/original.jpg   (5 parts)
    //          {date}/{safeEmail}/sessions/{time}/{attireId}_{time}/result.jpg   (6 parts)
    //          {date}/{safeEmail}/sessions/{time}/{attireId}_{time}/adorned.jpg  (6 parts)
    const parts = key.split("/");
    if (parts.length < 5) return null;

    const sessionTime = parts[3] || "";
    const filename = parts[parts.length - 1];

    if (parts.length === 5 && filename === "original.jpg") {
        return { key, type: "original", attireId: null, sessionTime };
    }

    if (parts.length === 6) {
        // parts[4] = "{attireId}_{HH-MM-SS}" — strip trailing time suffix
        const attirePart = parts[4] || "";
        const attireId = attirePart.replace(/_\d{2}-\d{2}-\d{2}$/, "") || attirePart;
        if (filename === "result.jpg") return { key, type: "result", attireId, sessionTime };
        if (filename === "adorned.jpg") return { key, type: "adorned", attireId, sessionTime };
    }

    return null;
}

async function listAllKeys(s3: S3Client, bucket: string, prefix: string): Promise<{ key: string; lastModified?: string }[]> {
    const keys: { key: string; lastModified?: string }[] = [];
    let continuationToken: string | undefined;

    do {
        const cmd = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken });
        const res = await s3.send(cmd);
        for (const obj of res.Contents || []) {
            if (obj.Key) keys.push({ key: obj.Key, lastModified: obj.LastModified?.toISOString() });
        }
        continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);

    return keys;
}

export async function GET(request: NextRequest) {
    const bucket = process.env.S3_TRYON_BUCKET;
    if (!bucket) return NextResponse.json({ error: "S3_TRYON_BUCKET not configured" }, { status: 500 });

    const s3 = getS3Client();
    if (!s3) return NextResponse.json({ error: "S3 credentials not configured" }, { status: 500 });

    const date = request.nextUrl.searchParams.get("date");

    if (!date) {
        // List available dates (top-level prefixes)
        const cmd = new ListObjectsV2Command({ Bucket: bucket, Delimiter: "/" });
        const res = await s3.send(cmd);
        const dates = (res.CommonPrefixes || [])
            .map((cp) => cp.Prefix?.replace(/\/$/, "") || "")
            .filter(Boolean)
            .sort()
            .reverse();
        return NextResponse.json({ ok: true, dates });
    }

    // List all images for the given date
    const rawKeys = await listAllKeys(s3, bucket, `${date}/`);

    // Group: customer → session → images
    const byCustomer = new Map<string, Map<string, S3Image[]>>();

    for (const { key, lastModified } of rawKeys) {
        const parts = key.split("/");
        const customer = parts[1] || "";
        if (!customer) continue;

        const parsed = parseKey(key);
        if (!parsed) continue;
        parsed.lastModified = lastModified;

        if (!byCustomer.has(customer)) byCustomer.set(customer, new Map());
        const sessions = byCustomer.get(customer)!;
        if (!sessions.has(parsed.sessionTime)) sessions.set(parsed.sessionTime, []);
        sessions.get(parsed.sessionTime)!.push(parsed);
    }

    const customers: S3Customer[] = [...byCustomer.entries()].map(([email, sessionMap]) => ({
        email,
        sessions: [...sessionMap.entries()]
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([sessionTime, images]) => ({
                sessionTime,
                images: images.sort((a, b) => {
                    const typeOrder: Record<S3ImageType, number> = { original: 0, result: 1, adorned: 2, unknown: 3 };
                    return typeOrder[a.type] - typeOrder[b.type];
                }),
            })),
    }));

    customers.sort((a, b) => {
        const aLatest = a.sessions[0]?.sessionTime || "";
        const bLatest = b.sessions[0]?.sessionTime || "";
        return bLatest.localeCompare(aLatest);
    });

    return NextResponse.json({ ok: true, date, customers });
}

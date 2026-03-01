import { NextResponse } from "next/server";

import { DEFAULT_BRANCH_ID } from "@/lib/branch-config";
import { getBranchDashboardData } from "@/lib/branch-mock-data";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
        return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const email = body.email.trim();
    const password = body.password.trim();

    if (!email || !password) {
        return NextResponse.json({ ok: false, error: "Email and password required" }, { status: 400 });
    }

    const dashboard = await getBranchDashboardData(DEFAULT_BRANCH_ID);

    return NextResponse.json({
        ok: true,
        user: {
            email,
            role: "operator",
            displayName: email.split("@")[0] || "Operator",
        },
        session: {
            issuedAt: new Date().toISOString(),
            expiresInSeconds: 3600,
        },
        dashboard,
    });
}

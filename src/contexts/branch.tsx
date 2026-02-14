"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

const BRANCH_STORAGE_KEY = "__ADORN_BRANCH__";

export const BRANCH_OPTIONS = [
    { id: "Bangalore", label: "Bangalore" },
    { id: "Mangalore", label: "Mangalore" },
    { id: "Chennai", label: "Chennai" },
    { id: "All", label: "All" },
] as const;

export type BranchId = (typeof BRANCH_OPTIONS)[number]["id"];

function getStoredBranch(): BranchId {
    if (typeof window === "undefined") return "Bangalore";
    try {
        const stored = sessionStorage.getItem(BRANCH_STORAGE_KEY);
        if (stored && BRANCH_OPTIONS.some((b) => b.id === stored)) return stored as BranchId;
    } catch {
        // ignore
    }
    return "Bangalore";
}

function branchFromUrl(searchParams: URLSearchParams | null): BranchId | null {
    if (!searchParams) return null;
    const b = searchParams.get("branch");
    if (b && BRANCH_OPTIONS.some((o) => o.id === b)) return b as BranchId;
    return null;
}

type BranchContextValue = {
    branch: BranchId;
    setBranch: (branch: BranchId) => void;
};

const BranchContext = createContext<BranchContextValue | null>(null);

const isCampaignsPage = (pathname: string) => pathname.startsWith("/campaigns");

export const BranchProvider = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const onCampaignsPage = isCampaignsPage(pathname);

    const [branch, setBranchState] = useState<BranchId>(() => {
        if (onCampaignsPage) return getStoredBranch();
        const fromUrl = branchFromUrl(searchParams);
        if (fromUrl) return fromUrl;
        return getStoredBranch();
    });

    useEffect(() => {
        if (onCampaignsPage) {
            const params = new URLSearchParams(searchParams.toString());
            if (params.has("branch")) {
                params.delete("branch");
                const q = params.toString();
                router.replace(q ? `${pathname}?${q}` : pathname);
            }
            return;
        }
        const fromUrl = branchFromUrl(searchParams);
        if (fromUrl) {
            setBranchState(fromUrl);
            try {
                sessionStorage.setItem(BRANCH_STORAGE_KEY, fromUrl);
            } catch {
                // ignore
            }
        } else {
            const current = getStoredBranch();
            const params = new URLSearchParams(searchParams.toString());
            params.set("branch", current);
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [searchParams, pathname, router, onCampaignsPage]);

    const setBranch = useCallback(
        (value: BranchId) => {
            setBranchState(value);
            try {
                sessionStorage.setItem(BRANCH_STORAGE_KEY, value);
            } catch {
                // ignore
            }
            if (onCampaignsPage) return;
            const params = new URLSearchParams(searchParams.toString());
            params.set("branch", value);
            router.replace(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams, onCampaignsPage]
    );

    const value = useMemo(() => ({ branch, setBranch }), [branch, setBranch]);

    return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
};

export const useBranch = (): BranchContextValue => {
    const ctx = useContext(BranchContext);
    if (!ctx) throw new Error("useBranch must be used within BranchProvider");
    return ctx;
};

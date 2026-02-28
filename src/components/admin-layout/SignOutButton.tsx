"use client";

import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export const SignOutButton = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <button className="text-error hover:bg-error/10 flex w-full items-center gap-3 px-4 py-2" onClick={handleSignOut}>
            <span className="iconify lucide--log-out size-4.5" />
            <span>Sign Out</span>
        </button>
    );
};

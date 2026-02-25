import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { LoginAuth } from "./LoginAuth";

export const metadata: Metadata = {
    title: "Login",
};

const LoginPage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#fff8f1] px-4 pt-14 pb-8 md:px-6 md:pt-20 md:pb-12">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(100%_80%_at_85%_0%,rgba(141,0,88,0.14),transparent_55%),radial-gradient(75%_65%_at_8%_95%,rgba(252,211,132,0.3),transparent_62%),linear-gradient(180deg,#fff9f3_0%,#fffdf9_100%)]" />
            <div className="pointer-events-none absolute -top-20 -right-20 -z-10 h-72 w-72 rounded-full bg-[#8d0058]/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 -left-20 -z-10 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />

            <div className="border-base-200/70 bg-base-100/90 mx-auto mt-8 max-w-xl rounded-3xl border p-6 shadow-xl backdrop-blur md:mt-12 md:p-8 lg:p-10">
                <div className="flex items-center justify-center">
                    <Link href="/auth/login" aria-label="Adorn login">
                        <img src="/images/favicon-adorn-jewellers.svg" alt="Adorn Jewellery" className="h-12 w-12" />
                    </Link>
                </div>
                <h3 className="mt-8 text-center text-xl font-semibold md:mt-10">Login</h3>
                <div className="mt-6 md:mt-8">
                    <LoginAuth />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

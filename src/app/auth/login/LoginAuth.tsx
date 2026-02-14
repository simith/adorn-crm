"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export const LoginAuth = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error ?? "Login failed");
                return;
            }
            if (data.ok && data.user) {
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("user", JSON.stringify(data.user));
                    if (data.session) {
                        sessionStorage.setItem("session", JSON.stringify(data.session));
                    }
                    if (data.dashboard) {
                        sessionStorage.setItem("dashboard", JSON.stringify(data.dashboard));
                    }
                }
                router.push("/dashboard");
                return;
            }
            setError("Invalid response");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div role="alert" className="alert alert-error mb-4 text-sm">
                    <span>{error}</span>
                </div>
            )}
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Email Address</legend>
                <label className="input w-full focus:outline-0">
                    <span className="iconify lucide--mail text-base-content/80 size-5"></span>
                    <input
                        className="grow focus:outline-0"
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </label>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Password</legend>
                <label className="input w-full focus:outline-0">
                    <span className="iconify lucide--key-round text-base-content/80 size-5"></span>
                    <input
                        className="grow focus:outline-0"
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        className="btn btn-xs btn-ghost btn-circle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password visibility">
                        {showPassword ? (
                            <span className="iconify lucide--eye-off size-4" />
                        ) : (
                            <span className="iconify lucide--eye size-4" />
                        )}
                    </button>
                </label>
            </fieldset>

            <div className="text-end">
                <Link className="label-text text-base-content/80 text-xs" href="/auth/forgot-password">
                    Forgot Password?
                </Link>
            </div>

            <div className="mt-4 flex items-center gap-3 md:mt-6">
                <input
                    className="checkbox checkbox-sm checkbox-primary"
                    aria-label="Checkbox example"
                    type="checkbox"
                    id="agreement"
                />
                <label htmlFor="agreement" className="text-sm">
                    I agree with
                    <span className="text-primary ms-1 cursor-pointer hover:underline">terms and conditions</span>
                </label>
            </div>

            <button
                type="submit"
                className="btn btn-primary btn-wide mt-4 max-w-full gap-3 md:mt-6"
                disabled={loading}>
                {loading ? (
                    <>
                        <span className="loading loading-spinner loading-sm" />
                        Logging in...
                    </>
                ) : (
                    <>
                        <span className="iconify lucide--log-in size-4" />
                        Login
                    </>
                )}
            </button>

            <button type="button" className="btn btn-ghost btn-wide border-base-300 mt-4 max-w-full gap-3">
                <img src="/images/brand-logo/google-mini.svg" className="size-6" alt="" />
                Login with Google
            </button>
        </form>
    );
};

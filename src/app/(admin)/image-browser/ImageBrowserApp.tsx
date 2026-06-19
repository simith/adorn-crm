"use client";

import { useEffect, useState } from "react";

import type { S3Customer, S3Image, S3ImageType } from "@/app/api/s3-browser/route";

type DatesResponse = { ok: boolean; dates?: string[] };
type ImagesResponse = { ok: boolean; date?: string; customers?: S3Customer[] };

type ZoomedImage =
    | { mode: "single"; key: string }
    | { mode: "compare"; before: string; after: string };

function formatDate(dateStr: string) {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatSessionTime(timeStr: string) {
    // timeStr is HH-MM-SS
    const [h, m] = timeStr.split("-");
    if (!h || !m) return timeStr;
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

function typeLabel(type: S3ImageType) {
    if (type === "original") return "Original";
    if (type === "result") return "Attire";
    if (type === "adorned") return "With Jewellery";
    return "Image";
}

function typeBadgeColor(type: S3ImageType) {
    if (type === "original") return "badge-neutral";
    if (type === "result") return "badge-primary";
    if (type === "adorned") return "badge-secondary";
    return "badge-ghost";
}

function groupByAttire(images: S3Image[]): { original?: S3Image; attires: { id: string; label: string; result?: S3Image; adorned?: S3Image }[] } {
    const original = images.find((img) => img.type === "original");
    const attireMap = new Map<string, { label: string; result?: S3Image; adorned?: S3Image }>();

    for (const img of images) {
        if (!img.attireId) continue;
        if (!attireMap.has(img.attireId)) attireMap.set(img.attireId, { label: img.attireName || img.attireId.replace(/_/g, " ") });
        const entry = attireMap.get(img.attireId)!;
        if (img.type === "result") entry.result = img;
        if (img.type === "adorned") entry.adorned = img;
    }

    const attires = [...attireMap.entries()].map(([id, data]) => ({ id, ...data }));
    return { original, attires };
}

export const ImageBrowserApp = () => {
    const [dates, setDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [customers, setCustomers] = useState<S3Customer[]>([]);
    const [customerFilter, setCustomerFilter] = useState("");
    const [loadingDates, setLoadingDates] = useState(true);
    const [loadingImages, setLoadingImages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [zoomed, setZoomed] = useState<ZoomedImage | null>(null);

    useEffect(() => {
        fetch("/api/s3-browser")
            .then(async (r) => {
                const text = await r.text();
                try {
                    return JSON.parse(text) as DatesResponse;
                } catch {
                    throw new Error(`API returned non-JSON: ${text.slice(0, 200)}`);
                }
            })
            .then((d) => {
                if (!d.ok) throw new Error((d as { error?: string }).error || "Failed to load dates");
                const available = d.dates || [];
                setDates(available);
                if (available[0]) setSelectedDate(available[0]);
            })
            .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
            .finally(() => setLoadingDates(false));
    }, []);

    useEffect(() => {
        if (!selectedDate) return;
        setLoadingImages(true);
        setCustomers([]);
        fetch(`/api/s3-browser?date=${encodeURIComponent(selectedDate)}`)
            .then(async (r) => {
                const text = await r.text();
                try {
                    return JSON.parse(text) as ImagesResponse;
                } catch {
                    throw new Error(`API returned non-JSON: ${text.slice(0, 200)}`);
                }
            })
            .then((d) => {
                if (!d.ok) throw new Error((d as { error?: string }).error || "Failed to load images");
                setCustomers(d.customers || []);
            })
            .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
            .finally(() => setLoadingImages(false));
    }, [selectedDate]);

    const filteredCustomers = customerFilter.trim()
        ? customers.filter((c) => c.email.toLowerCase().includes(customerFilter.trim().toLowerCase()))
        : customers;

    const totalImages = filteredCustomers.reduce(
        (sum, c) => sum + c.sessions.reduce((s2, sess) => s2 + sess.images.length, 0),
        0,
    );

    const s3Src = (key: string) => `/api/s3-image?key=${encodeURIComponent(key)}`;

    const openZoom = (images: S3Image[], clickedType: S3ImageType, clickedAttireId: string | null) => {
        const clicked = images.find((img) => img.type === clickedType && img.attireId === clickedAttireId);
        if (!clicked) return;

        if (clickedType === "adorned" || clickedType === "result") {
            // Try to show before/after for this attire
            const result = images.find((img) => img.attireId === clickedAttireId && img.type === "result");
            const adorned = images.find((img) => img.attireId === clickedAttireId && img.type === "adorned");
            if (result && adorned) {
                setZoomed({ mode: "compare", before: result.key, after: adorned.key });
                return;
            }
        }
        setZoomed({ mode: "single", key: clicked.key });
    };

    if (loadingDates) {
        return (
            <div className="space-y-4">
                <div className="bg-base-200/60 h-10 animate-pulse rounded-lg" />
                <div className="bg-base-200/60 h-64 animate-pulse rounded-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="border-error/30 bg-error/10 text-error rounded-lg border p-4 text-sm">
                {error}
            </div>
        );
    }

    if (dates.length === 0) {
        return (
            <div className="border-base-300 rounded-lg border border-dashed p-12 text-center">
                <span className="iconify lucide--image-off text-base-content/30 mx-auto mb-3 size-10" />
                <p className="font-semibold">No images in S3 yet</p>
                <p className="text-base-content/60 mt-1 text-sm">Try-on images will appear here once customers use the try-on feature.</p>
            </div>
        );
    }

    return (
        <>
            {/* Zoom overlay */}
            {zoomed && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm cursor-pointer"
                    onClick={() => setZoomed(null)}>
                    <div className="relative cursor-default" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute -top-3 -right-3 z-10 btn btn-circle btn-xs btn-neutral shadow-lg"
                            onClick={() => setZoomed(null)}>
                            <span className="iconify lucide--x size-3" />
                        </button>
                        {zoomed.mode === "compare" ? (
                            <div className="flex items-end gap-6 p-2">
                                <div className="flex flex-col items-center gap-2">
                                    <img
                                        src={s3Src(zoomed.before)}
                                        alt="Before"
                                        className="max-h-[75vh] max-w-[38vw] rounded-xl shadow-2xl object-contain"
                                    />
                                    <span className="text-white/80 text-sm font-medium">Before</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <img
                                        src={s3Src(zoomed.after)}
                                        alt="After"
                                        className="max-h-[75vh] max-w-[38vw] rounded-xl shadow-2xl object-contain"
                                    />
                                    <span className="text-white/80 text-sm font-medium">With Jewellery</span>
                                </div>
                            </div>
                        ) : (
                            <img
                                src={s3Src(zoomed.key)}
                                alt="Preview"
                                className="max-h-[85vh] max-w-[70vw] rounded-xl shadow-2xl object-contain"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold">Image Browser</h1>
                    <p className="text-base-content/60 text-sm">Browse all try-on images stored in S3</p>
                </div>
                <label className="input input-sm flex items-center gap-2">
                    <span className="iconify lucide--search text-base-content/50 size-4" />
                    <input
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                        type="search"
                        className="grow w-52"
                        placeholder="Filter by customer email"
                    />
                </label>
            </div>

            {/* Date tabs */}
            <div className="mb-5 flex flex-wrap gap-2">
                {dates.map((date) => (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`btn btn-sm ${selectedDate === date ? "btn-primary" : "btn-outline"}`}>
                        {formatDate(date)}
                    </button>
                ))}
            </div>

            {/* Stats bar */}
            {!loadingImages && (
                <div className="text-base-content/60 mb-4 text-xs">
                    {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""} · {totalImages} image{totalImages !== 1 ? "s" : ""} on {formatDate(selectedDate)}
                </div>
            )}

            {loadingImages && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-base-200/60 h-52 animate-pulse rounded-xl" />
                    ))}
                </div>
            )}

            {!loadingImages && filteredCustomers.length === 0 && (
                <div className="border-base-300 rounded-lg border border-dashed p-10 text-center">
                    <p className="text-base-content/60 text-sm">No images found for {formatDate(selectedDate)}</p>
                </div>
            )}

            {/* Customer sections */}
            {!loadingImages && filteredCustomers.map((customer) => (
                <div key={customer.email} className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="iconify lucide--user text-base-content/50 size-4" />
                        <h2 className="text-sm font-semibold">{customer.email}</h2>
                        <span className="text-base-content/40 text-xs">
                            {customer.sessions.length} session{customer.sessions.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {customer.sessions.map((session) => {
                            const { original, attires } = groupByAttire(session.images);

                            return (
                                <div key={session.sessionId} className="card bg-base-100 border border-base-200 shadow-sm p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="iconify lucide--clock text-base-content/40 size-3.5" />
                                        <p className="text-base-content/60 text-xs font-medium">
                                            Session at {formatSessionTime(session.sessionTime)}
                                        </p>
                                        <span className="text-base-content/30 text-xs">
                                            {session.images.length} images
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        {/* Original photo */}
                                        {original && (
                                            <div className="flex flex-col items-center gap-1.5">
                                                <button
                                                    onClick={() => setZoomed({ mode: "single", key: original.key })}
                                                    className="focus:outline-none cursor-zoom-in group">
                                                    <img
                                                        src={s3Src(original.key)}
                                                        alt="Original"
                                                        className="h-36 w-auto rounded-lg object-contain border border-base-200 group-hover:ring-2 group-hover:ring-neutral/30 transition-all"
                                                    />
                                                </button>
                                                <span className={`badge badge-xs badge-soft ${typeBadgeColor("original")}`}>
                                                    {typeLabel("original")}
                                                </span>
                                            </div>
                                        )}

                                        {/* Divider between original and generated */}
                                        {original && attires.length > 0 && (
                                            <div className="self-stretch flex items-center">
                                                <span className="iconify lucide--arrow-right text-base-content/30 size-5" />
                                            </div>
                                        )}

                                        {/* Per-attire pairs */}
                                        {attires.map((attire) => (
                                            <div key={attire.id} className="flex flex-col gap-1.5">
                                                <p className="text-base-content/50 text-[10px] font-medium uppercase tracking-wide text-center">
                                                    {attire.label}
                                                </p>
                                                <div className="flex gap-2">
                                                    {attire.result && (
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <button
                                                                onClick={() => openZoom(session.images, "result", attire.id)}
                                                                className="focus:outline-none cursor-zoom-in group">
                                                                <img
                                                                    src={s3Src(attire.result.key)}
                                                                    alt="Attire result"
                                                                    className="h-36 w-auto rounded-lg object-contain border border-base-200 group-hover:ring-2 group-hover:ring-primary/40 transition-all"
                                                                />
                                                            </button>
                                                            <span className={`badge badge-xs badge-soft ${typeBadgeColor("result")}`}>
                                                                {typeLabel("result")}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {attire.adorned && (
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <button
                                                                onClick={() => openZoom(session.images, "adorned", attire.id)}
                                                                className="focus:outline-none cursor-zoom-in group">
                                                                <img
                                                                    src={s3Src(attire.adorned.key)}
                                                                    alt="With jewellery"
                                                                    className="h-36 w-auto rounded-lg object-contain border border-base-200 group-hover:ring-2 group-hover:ring-secondary/40 transition-all"
                                                                />
                                                            </button>
                                                            <span className={`badge badge-xs badge-soft ${typeBadgeColor("adorned")}`}>
                                                                {typeLabel("adorned")}
                                                            </span>
                                                            {attire.adorned.jewelryName && (
                                                                <span className="text-base-content/40 text-[10px] text-center max-w-[80px] truncate">
                                                                    {attire.adorned.jewelryName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </>
    );
};

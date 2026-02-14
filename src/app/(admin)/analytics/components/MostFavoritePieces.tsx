"use client";

import { useEffect, useState } from "react";

function formatNum(x: number) {
    return x.toLocaleString();
}

/** Radial progress that animates from 0 to target on mount (smooth fill like Goal Status card). */
const AnimatedRadialProgress = ({
    targetPercent,
    className = "",
    size = "3.5rem",
    thickness = "3px",
}: {
    targetPercent: number;
    className?: string;
    size?: string;
    thickness?: string;
}) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            setValue(targetPercent);
        });
        return () => cancelAnimationFrame(id);
    }, [targetPercent]);

    const displayValue = Math.min(100, value);

    return (
        <div
            className={`radial-progress text-success [transition:--radialprogress_0.6s_ease-out] [&:after]:[transition:transform_0.6s_ease-out] ${className}`}
            style={
                {
                    "--value": displayValue,
                    "--size": size,
                    "--thickness": thickness,
                } as React.CSSProperties
            }
            role="progressbar"
            aria-valuenow={targetPercent}
        >
            <span className="text-sm font-bold">{targetPercent}%</span>
        </div>
    );
};

export type FavoriteItem = {
    name: string;
    rating?: number;
    reviews: number;
    likes: number;
    interestPercent: number;
    totalSales: number;
    goalPercent: number;
    imageUrl?: string;
};

export const MostFavoritePieces = ({ items }: { items: FavoriteItem[] }) => {
    return (
        <div className="card card-border bg-base-200/40">
            <div className="card-body">
                <h2 className="card-title text-xl font-bold text-base-content">Most Favorite Pieces</h2>
                <p className="text-sm text-base-content/60">Across top jewellery lines</p>
                <div className="mt-4 flex flex-col gap-6">
                    {items.map((item, idx) => (
                        <div key={idx}>
                            <div className="flex flex-wrap items-start gap-4">
                                <div className="avatar shrink-0">
                                    <div className="mask mask-squircle size-14 bg-base-300">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} />
                                        ) : (
                                            <img
                                                src={`https://picsum.photos/80/80?random=${idx}`}
                                                alt=""
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-base-content">{item.name}</p>
                                    <p className="text-sm text-base-content/60">
                                        {formatNum(item.reviews)} reviews • {formatNum(item.likes)} likes
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-6">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-base-content/50">Interest</p>
                                            <p className="text-xl font-bold text-base-content">{item.interestPercent}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-base-content/50">Total sales</p>
                                            <p className="text-xl font-bold text-base-content">{formatNum(item.totalSales)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AnimatedRadialProgress targetPercent={item.goalPercent} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {idx < items.length - 1 && <div className="mt-4 border-t border-base-300/60" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

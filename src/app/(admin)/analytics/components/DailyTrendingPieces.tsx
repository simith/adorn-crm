"use client";

function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export type TrendingItem = {
    rank: number;
    name: string;
    price: number;
    orders: number;
};

export const DailyTrendingPieces = ({ items }: { items: TrendingItem[] }) => {
    return (
        <div className="card card-border bg-base-200/40">
            <div className="card-body">
                <h2 className="card-title text-xl font-bold text-base-content">Daily Trending Pieces</h2>
                <p className="text-sm text-base-content/60">Top moving items today</p>
                <ul className="mt-4 flex flex-col gap-3">
                    {items.map((item) => (
                        <li key={item.rank}>
                            <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-content">
                                    #{item.rank}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-base-content">{item.name}</p>
                                    <p className="text-sm text-base-content/60">
                                        {formatPrice(item.price)} • {item.orders} orders
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

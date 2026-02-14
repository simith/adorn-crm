"use client";

function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
        price,
    );
}

export type TrendingItem = {
    rank: number;
    name: string;
    price: number;
    orders: number;
};

export const DailyTrendingPieces = ({ items }: { items: TrendingItem[] }) => {
    return (
        <div className="card card-border bg-base-100">
            <div className="card-body">
                <h2 className="card-title text-base-content text-xl font-bold">Daily Trending Pieces</h2>
                <p className="text-base-content/60 text-sm">Top moving items today</p>
                <ul className="mt-4 flex flex-col gap-3">
                    {items.map((item) => (
                        <li key={item.rank}>
                            <div className="bg-primary/10 flex items-center gap-3 rounded-xl px-4 py-3">
                                <span className="bg-primary text-primary-content flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                                    #{item.rank}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-base-content font-semibold">{item.name}</p>
                                    <p className="text-base-content/60 text-sm">
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

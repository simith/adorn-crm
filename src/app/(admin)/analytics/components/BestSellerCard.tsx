"use client";

export type BestSellerItem = {
    name: string;
    price: number;
    likes: number;
    sales: number;
    imageUrl?: string;
};

export type BestSellerData = {
    title: string;
    subtitle?: string;
    item: BestSellerItem;
};

function formatPrice(price: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

function formatNum(x: number) {
    return x.toLocaleString("en-IN");
}

export const BestSellerCard = ({ data }: { data: BestSellerData }) => {
    const title = data.title?.toLowerCase().includes("best seller") ? "Best Seller" : data.title;
    const subtitle = data.subtitle && !data.subtitle.toLowerCase().startsWith("lorem")
        ? data.subtitle
        : "Top jewellery this week";
    const item = data.item;

    if (!item) return null;

    return (
        <div className="card card-border bg-base-100 shadow-sm">
            <div className="card-body">
                <h2 className="card-title text-xl font-bold text-base-content">{title}</h2>
                <p className="text-sm text-base-content/60">{subtitle}</p>
                <div className="mt-4 flex flex-col items-center">
                    <div className="relative w-full overflow-hidden rounded-xl bg-base-200/50">
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-auto w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-64 w-full items-center justify-center">
                                <span
                                    className="iconify text-base-content/20"
                                    data-icon="lucide:gem"
                                    style={{ fontSize: "6rem" }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-4 w-full text-center">
                        <p className="text-lg font-bold text-base-content">{item.name}</p>
                        <p className="mt-1 text-sm text-base-content/60">
                            {formatPrice(item.price)} • {formatNum(item.likes)} likes
                        </p>
                        <p className="mt-1 text-lg font-bold text-base-content">{formatNum(item.sales)} sales</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

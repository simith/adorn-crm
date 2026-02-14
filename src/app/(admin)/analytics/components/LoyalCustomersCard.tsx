"use client";

export type LoyalCustomer = {
    name: string;
    orders: number;
};

export type LoyalCustomersData = {
    title: string;
    subtitle?: string;
    customers: LoyalCustomer[];
};

function getInitials(name: string) {
    return name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export const LoyalCustomersCard = ({ data }: { data: LoyalCustomersData }) => {
    const subtitle = data.subtitle && !data.subtitle.toLowerCase().startsWith("lorem")
        ? data.subtitle
        : "Repeat buyers this month";
    const customers = data.customers ?? [];

    return (
        <div className="card card-border bg-base-100 shadow-sm">
            <div className="card-body">
                <h2 className="card-title text-xl font-bold text-base-content">{data.title}</h2>
                <p className="text-sm text-base-content/60">{subtitle}</p>
                <ul className="mt-4 flex flex-col gap-4">
                    {customers.map((customer, idx) => (
                        <li key={idx} className="flex items-center gap-4">
                            <div
                                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-base font-bold uppercase tracking-tight text-green-600"
                                aria-hidden
                            >
                                {getInitials(customer.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-base-content">{customer.name}</p>
                                <p className="text-sm text-base-content/60">
                                    {customer.orders.toLocaleString("en-IN")} orders
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

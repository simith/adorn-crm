import type { IStatItem } from "./StatItem";

export const dashboardSalesStats: IStatItem[] = [
    {
        title: "Jewellery Sold",
        amount: "248",
        percent: 12.4,
        icon: "lucide--gem",
    },
    {
        title: "Orders Closed",
        amount: "176",
        percent: 8.7,
        icon: "lucide--shopping-bag",
    },
    {
        title: "Try-Ons Completed",
        amount: "421",
        percent: 10.2,
        icon: "lucide--sparkles",
    },
    {
        title: "Repeat Buyers",
        amount: "63",
        percent: 5.1,
        icon: "lucide--refresh-cw",
    },
];

export const dailyVirtualTryOnSales = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    series: [
        {
            name: "Jewellery Sold",
            values: [28, 34, 31, 39, 45, 41, 30],
        },
        {
            name: "Orders Closed",
            values: [18, 22, 20, 25, 29, 27, 19],
        },
    ],
};

export const tryOnConversion = {
    percent: 42,
    cta: "View Funnel",
    note: "42% of completed virtual try-ons converted into jewellery orders this week.",
};

export const topCategory = {
    title: "Best Selling Category",
    name: "Necklaces",
    units: 132,
    changePercent: 11.8,
    sparklinePoints: "0,48 25,42 50,44 75,34 100,28 125,24 150,16 175,14 200,10",
};

export const categoryBreakdown = [
    { name: "Necklaces", location: "132 units sold" },
    { name: "Earrings", location: "116 units sold" },
];

export const topJewellerySold = [
    { customer: "Temple Gold Necklace", date: "Necklaces", units: 34, status: "High Seller" },
    { customer: "Polki Bridal Necklace", date: "Necklaces", units: 27, status: "High Seller" },
    { customer: "Polki Drop Earrings", date: "Earrings", units: 25, status: "Steady" },
    { customer: "Emerald Stud Earrings", date: "Earrings", units: 22, status: "Steady" },
];

export const SALES_CATEGORIES = ["Necklaces", "Earrings", "Rings", "Bracelets", "Other"] as const;
export const SALES_REGIONS = [
    "All Branches",
    "Bangalore",
    "Mangaluru",
    "Udupi",
    "Shivamogga",
    "Karkala",
    "Kundapur",
    "Hebri",
    "Byndoor",
    "Brahmavar",
    "Chikmagalur",
    "Padubidri",
    "Kumta",
    "Belthangady",
    "Sagara",
    "Thirthahalli",
    "Panaji",
] as const;
export const SALES_CAMPAIGNS = ["All Campaigns", "Bridal Spotlight", "Festive Sparkle", "Wedding Week", "Everyday Elegance"] as const;

export type SalesCategory = (typeof SALES_CATEGORIES)[number];
export type SalesRegion = Exclude<(typeof SALES_REGIONS)[number], "All Branches">;
export type SalesCampaign = Exclude<(typeof SALES_CAMPAIGNS)[number], "All Campaigns">;
export type LeaderboardMetricKey = "unitsSold" | "ordersClosed" | "conversionRate" | "tryOnsAssisted";
export type CategoryModeKey = "mostSold" | "mostTried" | "highestConversion";
export type TrendGranularityKey = "daily" | "weekly" | "monthly";

export type SalesPerformanceApiFilters = {
    startDate: string;
    endDate: string;
    salespeople: string[];
    region: string;
    category: string;
    campaign: string;
};

export type KpiMetric = {
    key:
        | "totalUnitsSold"
        | "totalOrders"
        | "totalCustomers"
        | "totalTryOnsCompleted"
        | "conversionRate"
        | "averageItemsPerOrder"
        | "unitsSoldPerRep"
        | "avgCustomerRating";
    label: string;
    value: number;
    formattedValue: string;
    changePct: number;
    trend: "up" | "down";
    helperText: string;
};

export type SalesRepRow = {
    id: string;
    name: string;
    region: SalesRegion;
    unitsSold: number;
    ordersClosed: number;
    totalCustomers: number;
    conversionRate: number;
    tryOnsAssisted: number;
    tryOnsCompleted: number;
    avgItemsPerOrder: number;
    customerRating: number;
};

export type FunnelStage = {
    label: string;
    count: number;
    dropOffPct: number;
};

export type CategoryPerformance = {
    category: SalesCategory;
    unitsSold: number;
    tryOns: number;
    conversionRate: number;
};

export type TrendPoint = {
    label: string;
    unitsSold: number;
    conversionRate: number;
};

export type SalesPerformanceResponse = {
    generatedAt: string;
    filters: {
        applied: SalesPerformanceApiFilters;
        options: {
            salespeople: string[];
            regions: string[];
            categories: string[];
            campaigns: string[];
        };
    };
    kpis: KpiMetric[];
    leaderboard: {
        metrics: Array<{ key: LeaderboardMetricKey; label: string }>;
        rows: SalesRepRow[];
    };
    funnel: {
        stages: FunnelStage[];
    };
    categories: {
        modes: Array<{ key: CategoryModeKey; label: string }>;
        items: CategoryPerformance[];
    };
    trends: Record<TrendGranularityKey, TrendPoint[]>;
    radar: {
        axes: string[];
        reps: SalesRepRow[];
    };
    heatmap: {
        rows: SalesRepRow[];
    };
};

type SalesRepProfile = {
    id: string;
    name: string;
    region: SalesRegion;
    baseUnits: number;
    baseOrders: number;
    baseCustomers: number;
    baseTryOnsStarted: number;
    baseRating: number;
    categoryAffinity: Record<SalesCategory, number>;
    campaignAffinity: Record<SalesCampaign, number>;
    seed: number;
};

type SalesSnapshot = {
    rows: SalesRepRow[];
    funnelStages: FunnelStage[];
    categoryItems: CategoryPerformance[];
    totals: {
        totalUnitsSold: number;
        totalOrders: number;
        totalCustomers: number;
        totalTryOnsCompleted: number;
        conversionRate: number;
        averageItemsPerOrder: number;
        unitsSoldPerRep: number;
        avgCustomerRating: number;
        tryOnStarted: number;
        addedToCart: number;
        purchased: number;
    };
};

const SALES_REPS: SalesRepProfile[] = [
    {
        id: "aarav-menon",
        name: "Aarav Menon",
        region: "Bangalore",
        baseUnits: 138,
        baseOrders: 89,
        baseCustomers: 102,
        baseTryOnsStarted: 262,
        baseRating: 4.8,
        categoryAffinity: { Necklaces: 1.24, Earrings: 0.93, Rings: 0.87, Bracelets: 0.82, Other: 0.74 },
        campaignAffinity: {
            "Bridal Spotlight": 1.14,
            "Festive Sparkle": 0.98,
            "Wedding Week": 1.09,
            "Everyday Elegance": 0.92,
        },
        seed: 2,
    },
    {
        id: "priya-nair",
        name: "Priya Nair",
        region: "Mangaluru",
        baseUnits: 124,
        baseOrders: 81,
        baseCustomers: 94,
        baseTryOnsStarted: 236,
        baseRating: 4.7,
        categoryAffinity: { Necklaces: 0.94, Earrings: 1.21, Rings: 0.96, Bracelets: 0.88, Other: 0.79 },
        campaignAffinity: {
            "Bridal Spotlight": 1.02,
            "Festive Sparkle": 1.1,
            "Wedding Week": 1.03,
            "Everyday Elegance": 0.95,
        },
        seed: 4,
    },
    {
        id: "rohan-kulkarni",
        name: "Rohan Kulkarni",
        region: "Udupi",
        baseUnits: 116,
        baseOrders: 76,
        baseCustomers: 91,
        baseTryOnsStarted: 223,
        baseRating: 4.5,
        categoryAffinity: { Necklaces: 0.88, Earrings: 0.91, Rings: 1.16, Bracelets: 1.02, Other: 0.77 },
        campaignAffinity: {
            "Bridal Spotlight": 0.96,
            "Festive Sparkle": 1.08,
            "Wedding Week": 1.01,
            "Everyday Elegance": 1.04,
        },
        seed: 6,
    },
    {
        id: "ananya-iyer",
        name: "Ananya Iyer",
        region: "Shivamogga",
        baseUnits: 145,
        baseOrders: 92,
        baseCustomers: 108,
        baseTryOnsStarted: 271,
        baseRating: 4.9,
        categoryAffinity: { Necklaces: 1.18, Earrings: 1.07, Rings: 0.92, Bracelets: 0.84, Other: 0.72 },
        campaignAffinity: {
            "Bridal Spotlight": 1.16,
            "Festive Sparkle": 1.03,
            "Wedding Week": 1.12,
            "Everyday Elegance": 0.94,
        },
        seed: 8,
    },
    {
        id: "vikram-singh",
        name: "Vikram Singh",
        region: "Karkala",
        baseUnits: 119,
        baseOrders: 78,
        baseCustomers: 88,
        baseTryOnsStarted: 216,
        baseRating: 4.4,
        categoryAffinity: { Necklaces: 0.99, Earrings: 0.83, Rings: 1.14, Bracelets: 0.94, Other: 0.8 },
        campaignAffinity: {
            "Bridal Spotlight": 1.08,
            "Festive Sparkle": 0.95,
            "Wedding Week": 1.07,
            "Everyday Elegance": 0.97,
        },
        seed: 10,
    },
    {
        id: "meera-kapoor",
        name: "Meera Kapoor",
        region: "Kundapur",
        baseUnits: 132,
        baseOrders: 86,
        baseCustomers: 98,
        baseTryOnsStarted: 245,
        baseRating: 4.8,
        categoryAffinity: { Necklaces: 1.12, Earrings: 1.04, Rings: 0.91, Bracelets: 0.89, Other: 0.76 },
        campaignAffinity: {
            "Bridal Spotlight": 1.11,
            "Festive Sparkle": 1.01,
            "Wedding Week": 1.06,
            "Everyday Elegance": 0.98,
        },
        seed: 12,
    },
    {
        id: "karthik-reddy",
        name: "Karthik Reddy",
        region: "Hebri",
        baseUnits: 111,
        baseOrders: 72,
        baseCustomers: 84,
        baseTryOnsStarted: 214,
        baseRating: 4.3,
        categoryAffinity: { Necklaces: 0.9, Earrings: 0.86, Rings: 1.09, Bracelets: 1.04, Other: 0.82 },
        campaignAffinity: {
            "Bridal Spotlight": 0.97,
            "Festive Sparkle": 1.05,
            "Wedding Week": 1.02,
            "Everyday Elegance": 1.03,
        },
        seed: 14,
    },
    {
        id: "neha-sharma",
        name: "Neha Sharma",
        region: "Byndoor",
        baseUnits: 127,
        baseOrders: 82,
        baseCustomers: 96,
        baseTryOnsStarted: 241,
        baseRating: 4.6,
        categoryAffinity: { Necklaces: 1.03, Earrings: 1.15, Rings: 0.94, Bracelets: 0.88, Other: 0.75 },
        campaignAffinity: {
            "Bridal Spotlight": 1.04,
            "Festive Sparkle": 1.09,
            "Wedding Week": 1.01,
            "Everyday Elegance": 0.96,
        },
        seed: 16,
    },
    {
        id: "aditya-joshi",
        name: "Aditya Joshi",
        region: "Brahmavar",
        baseUnits: 108,
        baseOrders: 70,
        baseCustomers: 82,
        baseTryOnsStarted: 205,
        baseRating: 4.2,
        categoryAffinity: { Necklaces: 0.92, Earrings: 0.87, Rings: 1.08, Bracelets: 0.97, Other: 0.84 },
        campaignAffinity: {
            "Bridal Spotlight": 0.94,
            "Festive Sparkle": 1.02,
            "Wedding Week": 1.04,
            "Everyday Elegance": 1.05,
        },
        seed: 18,
    },
    {
        id: "kavya-pillai",
        name: "Kavya Pillai",
        region: "Chikmagalur",
        baseUnits: 121,
        baseOrders: 79,
        baseCustomers: 93,
        baseTryOnsStarted: 232,
        baseRating: 4.7,
        categoryAffinity: { Necklaces: 1.06, Earrings: 1.11, Rings: 0.95, Bracelets: 0.9, Other: 0.78 },
        campaignAffinity: {
            "Bridal Spotlight": 1.03,
            "Festive Sparkle": 1.07,
            "Wedding Week": 1.05,
            "Everyday Elegance": 0.97,
        },
        seed: 20,
    },
];

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 0) {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
}

function formatPercent(value: number) {
    return `${round(value, 1).toFixed(1)}%`;
}

function formatDecimal(value: number) {
    return round(value, 1).toFixed(1);
}

function parseDate(value: string) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? new Date() : date;
}

function toIsoDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
}

function diffInDays(start: Date, end: Date) {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay) + 1);
}

function formatShortDate(date: Date) {
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

function formatMonthLabel(date: Date) {
    return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" });
}

export function getDefaultSalesPerformanceFilters(): SalesPerformanceApiFilters {
    const endDate = new Date();
    const startDate = addDays(endDate, -29);

    return {
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
        salespeople: [],
        region: "All Branches",
        category: "All Categories",
        campaign: "All Campaigns",
    };
}

export function normalizeSalesPerformanceFilters(filters: Partial<SalesPerformanceApiFilters>): SalesPerformanceApiFilters {
    const defaults = getDefaultSalesPerformanceFilters();
    const normalized: SalesPerformanceApiFilters = {
        startDate: filters.startDate ?? defaults.startDate,
        endDate: filters.endDate ?? defaults.endDate,
        salespeople: (filters.salespeople ?? []).filter((value) => SALES_REPS.some((rep) => rep.name === value)),
        region: SALES_REGIONS.includes((filters.region ?? defaults.region) as (typeof SALES_REGIONS)[number]) ? (filters.region ?? defaults.region) : defaults.region,
        category:
            filters.category === "All Categories" || SALES_CATEGORIES.includes((filters.category ?? defaults.category) as SalesCategory)
                ? (filters.category ?? defaults.category)
                : defaults.category,
        campaign:
            filters.campaign === "All Campaigns" || SALES_CAMPAIGNS.includes((filters.campaign ?? defaults.campaign) as (typeof SALES_CAMPAIGNS)[number])
                ? (filters.campaign ?? defaults.campaign)
                : defaults.campaign,
    };

    const start = parseDate(normalized.startDate);
    const end = parseDate(normalized.endDate);
    if (start.getTime() > end.getTime()) {
        normalized.startDate = defaults.startDate;
        normalized.endDate = defaults.endDate;
    }

    return normalized;
}

function getCategoryFactor(profile: SalesRepProfile, category: string) {
    if (category === "All Categories") return 1;
    return profile.categoryAffinity[category as SalesCategory] ?? 1;
}

function getCampaignFactor(profile: SalesRepProfile, campaign: string) {
    if (campaign === "All Campaigns") return 1;
    return profile.campaignAffinity[campaign as SalesCampaign] ?? 1;
}

function getPreviousPeriodFactor(filters: SalesPerformanceApiFilters) {
    const start = parseDate(filters.startDate);
    const end = parseDate(filters.endDate);
    const periodDays = diffInDays(start, end);
    return clamp(0.91 + periodDays / 500, 0.9, 0.98);
}

function buildRepRow(profile: SalesRepProfile, filters: SalesPerformanceApiFilters, totalDays: number): SalesRepRow {
    const daysFactor = totalDays / 30;
    const regionFactor = filters.region === "All Branches" || filters.region === profile.region ? 1 : 0;
    const categoryFactor = getCategoryFactor(profile, filters.category);
    const campaignFactor = getCampaignFactor(profile, filters.campaign);
    const seedFactor = 1 + ((profile.seed % 5) - 2) * 0.015;
    const combinedFactor = daysFactor * categoryFactor * campaignFactor * seedFactor * regionFactor;

    const unitsSold = Math.round(profile.baseUnits * combinedFactor);
    const ordersClosed = Math.max(0, Math.round(profile.baseOrders * combinedFactor * 0.98));
    const totalCustomers = Math.max(0, Math.round(profile.baseCustomers * combinedFactor * 1.02));
    const tryOnsAssisted = Math.max(0, Math.round(profile.baseTryOnsStarted * combinedFactor));
    const tryOnsCompleted = Math.max(0, Math.round(tryOnsAssisted * clamp(0.78 + profile.seed * 0.004, 0.72, 0.91)));
    const avgItemsPerOrder = ordersClosed > 0 ? round(unitsSold / ordersClosed, 1) : 0;
    const conversionRate = tryOnsCompleted > 0 ? round((ordersClosed / tryOnsCompleted) * 100, 1) : 0;
    const customerRating = round(clamp(profile.baseRating + (campaignFactor - 1) * 0.2 + (categoryFactor - 1) * 0.12, 4.0, 5.0), 1);

    return {
        id: profile.id,
        name: profile.name,
        region: profile.region,
        unitsSold,
        ordersClosed,
        totalCustomers,
        conversionRate,
        tryOnsAssisted,
        tryOnsCompleted,
        avgItemsPerOrder,
        customerRating,
    };
}

function bucketCount(totalDays: number, granularity: TrendGranularityKey) {
    if (granularity === "daily") return Math.min(totalDays, 14);
    if (granularity === "weekly") return Math.min(Math.max(4, Math.ceil(totalDays / 7)), 8);
    return Math.min(Math.max(3, Math.ceil(totalDays / 30)), 6);
}

function buildTrendSeries(snapshot: SalesSnapshot, filters: SalesPerformanceApiFilters, granularity: TrendGranularityKey): TrendPoint[] {
    const start = parseDate(filters.startDate);
    const end = parseDate(filters.endDate);
    const totalDays = diffInDays(start, end);
    const count = bucketCount(totalDays, granularity);
    const unitsBase = snapshot.totals.totalUnitsSold / count;
    const conversionBase = snapshot.totals.conversionRate;

    // Keep the trend stable for a given filter set so the dashboard feels consistent.
    return Array.from({ length: count }, (_, index) => {
        const progress = count === 1 ? 0 : index / (count - 1);
        const seasonal = Math.sin((index + 1) * 1.2) * 0.08;
        const growth = (progress - 0.5) * 0.16;
        const seed = 1 + seasonal + growth;
        const unitsSold = Math.max(0, Math.round(unitsBase * seed));
        const conversionRate = round(clamp(conversionBase * (0.94 + progress * 0.1 + seasonal * 0.3), 15, 65), 1);

        if (granularity === "daily") {
            const labelDate = addDays(start, Math.round((totalDays - 1) * progress));
            return { label: formatShortDate(labelDate), unitsSold, conversionRate };
        }

        if (granularity === "weekly") {
            return { label: `Week ${index + 1}`, unitsSold, conversionRate };
        }

        const monthDate = addDays(start, Math.round((totalDays - 1) * progress));
        return { label: formatMonthLabel(monthDate), unitsSold, conversionRate };
    });
}

function buildCategoryItems(snapshot: SalesSnapshot, filters: SalesPerformanceApiFilters): CategoryPerformance[] {
    const totalUnits = snapshot.totals.totalUnitsSold;
    const totalTryOns = snapshot.totals.totalTryOnsCompleted;

    return SALES_CATEGORIES.map((category, index) => {
        const emphasis = filters.category === "All Categories" ? 1 : category === filters.category ? 1.35 : 0.82;
        const unitsShare = [0.28, 0.22, 0.2, 0.18, 0.12][index] * emphasis;
        const tryOnShare = [0.26, 0.24, 0.19, 0.17, 0.14][index] * emphasis;
        const unitsSold = Math.max(0, Math.round(totalUnits * unitsShare * 0.92));
        const tryOns = Math.max(0, Math.round(totalTryOns * tryOnShare * 0.94));
        const conversionRate = tryOns > 0 ? round((unitsSold / tryOns) * 100, 1) : 0;
        return { category, unitsSold, tryOns, conversionRate };
    }).sort((left, right) => right.unitsSold - left.unitsSold);
}

function buildSnapshot(filters: SalesPerformanceApiFilters): SalesSnapshot {
    const start = parseDate(filters.startDate);
    const end = parseDate(filters.endDate);
    const totalDays = diffInDays(start, end);
    const selectedNames = new Set(filters.salespeople);

    const rows = SALES_REPS.map((profile) => buildRepRow(profile, filters, totalDays)).filter((row) => {
        if (row.unitsSold <= 0 && row.ordersClosed <= 0 && row.tryOnsAssisted <= 0) return false;
        if (selectedNames.size > 0 && !selectedNames.has(row.name)) return false;
        return true;
    });

    const totalUnitsSold = rows.reduce((sum, row) => sum + row.unitsSold, 0);
    const totalOrders = rows.reduce((sum, row) => sum + row.ordersClosed, 0);
    const totalCustomers = rows.reduce((sum, row) => sum + row.totalCustomers, 0);
    const totalTryOnsCompleted = rows.reduce((sum, row) => sum + row.tryOnsCompleted, 0);
    const tryOnStarted = rows.reduce((sum, row) => sum + row.tryOnsAssisted, 0);
    const addedToCart = Math.round(totalOrders * 1.16);
    const purchased = totalOrders;
    const conversionRate = totalTryOnsCompleted > 0 ? round((totalOrders / totalTryOnsCompleted) * 100, 1) : 0;
    const averageItemsPerOrder = totalOrders > 0 ? round(totalUnitsSold / totalOrders, 1) : 0;
    const unitsSoldPerRep = rows.length > 0 ? round(totalUnitsSold / rows.length, 1) : 0;
    const avgCustomerRating = rows.length > 0 ? round(rows.reduce((sum, row) => sum + row.customerRating, 0) / rows.length, 1) : 0;

    const funnelSource = [
        { label: "Virtual Try-On Started", count: tryOnStarted },
        { label: "Try-On Completed", count: totalTryOnsCompleted },
        { label: "Added to Cart", count: addedToCart },
        { label: "Purchased", count: purchased },
    ];

    const funnelStages = funnelSource.map((stage, index) => {
        const previous = funnelSource[index - 1]?.count ?? stage.count;
        const dropOffPct = index === 0 || previous <= 0 ? 0 : round(((previous - stage.count) / previous) * 100, 1);
        return { ...stage, dropOffPct };
    });

    const totals = {
        totalUnitsSold,
        totalOrders,
        totalCustomers,
        totalTryOnsCompleted,
        conversionRate,
        averageItemsPerOrder,
        unitsSoldPerRep,
        avgCustomerRating,
        tryOnStarted,
        addedToCart,
        purchased,
    };

    return {
        rows,
        funnelStages,
        categoryItems: buildCategoryItems({ rows, funnelStages, categoryItems: [], totals }, filters),
        totals,
    };
}

function buildKpis(current: SalesSnapshot, previous: SalesSnapshot): KpiMetric[] {
    const metrics = [
        {
            key: "totalUnitsSold",
            label: "Total Units Sold",
            value: current.totals.totalUnitsSold,
            previousValue: previous.totals.totalUnitsSold,
            formattedValue: `${current.totals.totalUnitsSold}`,
            helperText: "Jewellery units closed across the selected team.",
        },
        {
            key: "totalOrders",
            label: "Total Orders",
            value: current.totals.totalOrders,
            previousValue: previous.totals.totalOrders,
            formattedValue: `${current.totals.totalOrders}`,
            helperText: "Completed orders sourced from virtual try-on activity.",
        },
        {
            key: "totalCustomers",
            label: "Total Customers",
            value: current.totals.totalCustomers,
            previousValue: previous.totals.totalCustomers,
            formattedValue: `${current.totals.totalCustomers}`,
            helperText: "Customers engaged by the selected sales team.",
        },
        {
            key: "totalTryOnsCompleted",
            label: "Virtual Try-Ons Completed",
            value: current.totals.totalTryOnsCompleted,
            previousValue: previous.totals.totalTryOnsCompleted,
            formattedValue: `${current.totals.totalTryOnsCompleted}`,
            helperText: "Completed try-ons tracked inside the selected period.",
        },
        {
            key: "conversionRate",
            label: "Conversion Rate",
            value: current.totals.conversionRate,
            previousValue: previous.totals.conversionRate,
            formattedValue: formatPercent(current.totals.conversionRate),
            helperText: "Try-on to purchase conversion across completed try-ons.",
        },
        {
            key: "averageItemsPerOrder",
            label: "Average Items per Order",
            value: current.totals.averageItemsPerOrder,
            previousValue: previous.totals.averageItemsPerOrder,
            formattedValue: formatDecimal(current.totals.averageItemsPerOrder),
            helperText: "Average jewellery units attached to each closed order.",
        },
        {
            key: "unitsSoldPerRep",
            label: "Units Sold per Rep",
            value: current.totals.unitsSoldPerRep,
            previousValue: previous.totals.unitsSoldPerRep,
            formattedValue: formatDecimal(current.totals.unitsSoldPerRep),
            helperText: "Mean unit output per active salesperson in view.",
        },
        {
            key: "avgCustomerRating",
            label: "Avg Customer Rating",
            value: current.totals.avgCustomerRating,
            previousValue: previous.totals.avgCustomerRating,
            formattedValue: formatDecimal(current.totals.avgCustomerRating),
            helperText: "Post-session customer feedback score when available.",
        },
    ] as const;

    return metrics.map((metric) => {
        const base = metric.previousValue === 0 ? 1 : metric.previousValue;
        const changePct = round(((metric.value - metric.previousValue) / base) * 100, 1);
        return {
            key: metric.key,
            label: metric.label,
            value: metric.value,
            formattedValue: metric.formattedValue,
            changePct,
            trend: changePct >= 0 ? "up" : "down",
            helperText: metric.helperText,
        };
    });
}

export function buildSalesPerformanceResponse(filters: Partial<SalesPerformanceApiFilters>): SalesPerformanceResponse {
    const applied = normalizeSalesPerformanceFilters(filters);
    const currentSnapshot = buildSnapshot(applied);

    const start = parseDate(applied.startDate);
    const end = parseDate(applied.endDate);
    const periodDays = diffInDays(start, end);
    const previousEnd = addDays(start, -1);
    const previousStart = addDays(previousEnd, -(periodDays - 1));
    const periodFactor = getPreviousPeriodFactor(applied);

    const previousSnapshot = buildSnapshot({
        ...applied,
        startDate: toIsoDate(previousStart),
        endDate: toIsoDate(previousEnd),
    });

    previousSnapshot.rows = previousSnapshot.rows.map((row) => ({
        ...row,
        unitsSold: Math.round(row.unitsSold * periodFactor),
        ordersClosed: Math.round(row.ordersClosed * periodFactor),
        totalCustomers: Math.round(row.totalCustomers * periodFactor),
        tryOnsAssisted: Math.round(row.tryOnsAssisted * periodFactor),
        tryOnsCompleted: Math.round(row.tryOnsCompleted * periodFactor),
        conversionRate: round(row.conversionRate * periodFactor, 1),
        avgItemsPerOrder: round(row.avgItemsPerOrder * periodFactor, 1),
        customerRating: round(clamp(row.customerRating * (0.98 + periodFactor * 0.02), 4.0, 5.0), 1),
    }));
    previousSnapshot.totals = {
        totalUnitsSold: Math.round(currentSnapshot.totals.totalUnitsSold * periodFactor),
        totalOrders: Math.round(currentSnapshot.totals.totalOrders * periodFactor),
        totalCustomers: Math.round(currentSnapshot.totals.totalCustomers * periodFactor),
        totalTryOnsCompleted: Math.round(currentSnapshot.totals.totalTryOnsCompleted * periodFactor),
        conversionRate: round(currentSnapshot.totals.conversionRate * periodFactor, 1),
        averageItemsPerOrder: round(currentSnapshot.totals.averageItemsPerOrder * periodFactor, 1),
        unitsSoldPerRep: round(currentSnapshot.totals.unitsSoldPerRep * periodFactor, 1),
        avgCustomerRating: round(clamp(currentSnapshot.totals.avgCustomerRating * (0.98 + periodFactor * 0.02), 4.0, 5.0), 1),
        tryOnStarted: Math.round(currentSnapshot.totals.tryOnStarted * periodFactor),
        addedToCart: Math.round(currentSnapshot.totals.addedToCart * periodFactor),
        purchased: Math.round(currentSnapshot.totals.purchased * periodFactor),
    };

    return {
        generatedAt: new Date().toISOString(),
        filters: {
            applied,
            options: {
                salespeople: SALES_REPS.map((rep) => rep.name),
                regions: [...SALES_REGIONS],
                categories: ["All Categories", ...SALES_CATEGORIES],
                campaigns: [...SALES_CAMPAIGNS],
            },
        },
        kpis: buildKpis(currentSnapshot, previousSnapshot),
        leaderboard: {
            metrics: [
                { key: "unitsSold", label: "Total Units Sold" },
                { key: "ordersClosed", label: "Orders Closed" },
                { key: "conversionRate", label: "Conversion Rate" },
                { key: "tryOnsAssisted", label: "Try-Ons Assisted" },
            ],
            rows: currentSnapshot.rows,
        },
        funnel: {
            stages: currentSnapshot.funnelStages,
        },
        categories: {
            modes: [
                { key: "mostSold", label: "Most Sold Categories" },
                { key: "mostTried", label: "Most Tried Categories" },
                { key: "highestConversion", label: "Highest Conversion Categories" },
            ],
            items: currentSnapshot.categoryItems,
        },
        trends: {
            daily: buildTrendSeries(currentSnapshot, applied, "daily"),
            weekly: buildTrendSeries(currentSnapshot, applied, "weekly"),
            monthly: buildTrendSeries(currentSnapshot, applied, "monthly"),
        },
        radar: {
            axes: ["Units Sold", "Conversion Rate", "Avg Items per Order", "Try-Ons Assisted", "Customer Rating"],
            reps: [...currentSnapshot.rows].sort((left, right) => right.unitsSold - left.unitsSold).slice(0, 5),
        },
        heatmap: {
            rows: currentSnapshot.rows,
        },
    };
}

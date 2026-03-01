export type SalesPerformanceFilters = {
    dateFrom: string;
    dateTo: string;
    salespeople: string[];
    region: string;
    category: string;
    campaign: string;
};

export type SalesPerformanceOption = {
    label: string;
    value: string;
};

export type SalesPerformanceSalesperson = {
    id: string;
    name: string;
    region: string;
};

export type SalesPerformanceKpi = {
    key:
        | "unitsSold"
        | "orders"
        | "customers"
        | "tryOnsCompleted"
        | "conversionRate"
        | "avgItemsPerOrder"
        | "unitsSoldPerRep"
        | "avgCustomerRating";
    label: string;
    value: number;
    changePct: number;
    trend: "up" | "down" | "flat";
    format: "integer" | "decimal" | "percentage";
};

export type SalesPerformanceLeaderboardRow = {
    salespersonId: string;
    salespersonName: string;
    region: string;
    unitsSold: number;
    ordersClosed: number;
    conversionRate: number;
    tryOnsAssisted: number;
};

export type SalesPerformanceFunnelStage = {
    stage: string;
    count: number;
    dropOffPct: number;
};

export type SalesPerformanceCategoryRow = {
    category: string;
    unitsSold: number;
    tryOnsCompleted: number;
    conversionRate: number;
};

export type SalesPerformanceTrendPoint = {
    label: string;
    unitsSold: number;
    conversionRate: number;
};

export type SalesPerformanceRadarRow = {
    salespersonId: string;
    salespersonName: string;
    unitsSold: number;
    conversionRate: number;
    avgItemsPerOrder: number;
    tryOnsAssisted: number;
    customerRating: number;
};

export type SalesPerformanceTableRow = {
    salespersonId: string;
    salespersonName: string;
    region: string;
    unitsSold: number;
    ordersClosed: number;
    conversionRate: number;
    tryOnsAssisted: number;
    avgItemsPerOrder: number;
    customerRating: number;
};

export type SalesPerformanceResponse = {
    meta: {
        generatedAt: string;
        framework: "React + ApexCharts";
    };
    filters: {
        applied: SalesPerformanceFilters;
        options: {
            salespeople: SalesPerformanceSalesperson[];
            regions: SalesPerformanceOption[];
            categories: SalesPerformanceOption[];
            campaigns: SalesPerformanceOption[];
        };
    };
    summary: {
        kpis: SalesPerformanceKpi[];
    };
    leaderboard: {
        metricOptions: SalesPerformanceOption[];
        rows: SalesPerformanceLeaderboardRow[];
    };
    funnel: {
        stages: SalesPerformanceFunnelStage[];
    };
    categoryPerformance: {
        modeOptions: SalesPerformanceOption[];
        rows: SalesPerformanceCategoryRow[];
    };
    trends: {
        granularities: SalesPerformanceOption[];
        daily: SalesPerformanceTrendPoint[];
        weekly: SalesPerformanceTrendPoint[];
        monthly: SalesPerformanceTrendPoint[];
    };
    radarComparison: {
        rows: SalesPerformanceRadarRow[];
    };
    performanceTable: {
        rows: SalesPerformanceTableRow[];
    };
    empty: boolean;
};

type DailyPerformanceRecord = {
    date: string;
    salespersonId: string;
    salespersonName: string;
    region: string;
    category: string;
    campaign: string;
    appVisits: number;
    tryOnsStarted: number;
    tryOnsCompleted: number;
    addedToCart: number;
    purchases: number;
    ordersClosed: number;
    unitsSold: number;
    customers: number;
    tryOnsAssisted: number;
    ratingAverage: number;
    ratingCount: number;
};

type LeaderboardAccumulator = SalesPerformanceLeaderboardRow & {
    purchases: number;
    tryOnsCompleted: number;
};

type RadarAccumulator = SalesPerformanceRadarRow & {
    ordersClosed: number;
    purchases: number;
    tryOnsCompleted: number;
    ratingWeighted: number;
    ratingCount: number;
};

type TableAccumulator = SalesPerformanceTableRow & {
    purchases: number;
    tryOnsCompleted: number;
    ratingWeighted: number;
    ratingCount: number;
};

const CATEGORY_OPTIONS = ["Necklaces", "Earrings", "Rings", "Bracelets", "Other"] as const;
const CAMPAIGN_OPTIONS = ["Bridal Spotlight", "Festive Gold Edit", "Diamond Moments", "Wedding Concierge"] as const;

const SALESPEOPLE: SalesPerformanceSalesperson[] = [
    { id: "aarav-mehta", name: "Aarav Mehta", region: "West" },
    { id: "priya-nair", name: "Priya Nair", region: "South" },
    { id: "rohan-iyer", name: "Rohan Iyer", region: "South" },
    { id: "sneha-kapoor", name: "Sneha Kapoor", region: "North" },
    { id: "arjun-malhotra", name: "Arjun Malhotra", region: "North" },
    { id: "kavya-reddy", name: "Kavya Reddy", region: "South" },
    { id: "vikram-joshi", name: "Vikram Joshi", region: "West" },
    { id: "meera-menon", name: "Meera Menon", region: "South" },
    { id: "rahul-bansal", name: "Rahul Bansal", region: "East" },
    { id: "ananya-deshpande", name: "Ananya Deshpande", region: "West" },
];

const DEFAULT_END_DATE = "2026-03-01";
const DEFAULT_START_DATE = "2026-01-31";
const MOCK_DATA_START_DATE = "2026-01-01";

export const DEFAULT_SALES_PERFORMANCE_FILTERS: SalesPerformanceFilters = {
    dateFrom: DEFAULT_START_DATE,
    dateTo: DEFAULT_END_DATE,
    salespeople: [],
    region: "all",
    category: "all",
    campaign: "all",
};

const REGIONS = Array.from(new Set(SALESPEOPLE.map((salesperson) => salesperson.region)));

let mockRecordsCache: DailyPerformanceRecord[] | null = null;

function parseDate(value: string) {
    return new Date(`${value}T00:00:00Z`);
}

function toIsoDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
}

function dateDiffInDays(start: string, end: string) {
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    return Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
}

function clamp(number: number, min: number, max: number) {
    return Math.min(max, Math.max(min, number));
}

function round(value: number, digits = 1) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

function percentageChange(current: number, previous: number) {
    if (previous === 0) {
        return current === 0 ? 0 : 100;
    }

    return round(((current - previous) / previous) * 100, 1);
}

function conversionRate(purchases: number, tryOnsCompleted: number) {
    if (tryOnsCompleted === 0) {
        return 0;
    }

    return round((purchases / tryOnsCompleted) * 100, 1);
}

function averageItemsPerOrder(unitsSold: number, ordersClosed: number) {
    if (ordersClosed === 0) {
        return 0;
    }

    return round(unitsSold / ordersClosed, 2);
}

function averageUnitsPerRep(unitsSold: number, repCount: number) {
    if (repCount === 0) {
        return 0;
    }

    return round(unitsSold / repCount, 1);
}

function averageRating(totalWeightedRating: number, totalRatings: number) {
    if (totalRatings === 0) {
        return 0;
    }

    return round(totalWeightedRating / totalRatings, 1);
}

function getIsoWeekLabel(dateValue: string) {
    const date = parseDate(dateValue);
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function getMonthLabel(dateValue: string) {
    return dateValue.slice(0, 7);
}

function buildMockRecords() {
    if (mockRecordsCache) {
        return mockRecordsCache;
    }

    // Mock daily rollups are generated deterministically so charts stay stable across reloads.
    const records: DailyPerformanceRecord[] = [];
    const startDate = parseDate(MOCK_DATA_START_DATE);
    const endDate = parseDate(DEFAULT_END_DATE);
    const dayCount = dateDiffInDays(MOCK_DATA_START_DATE, DEFAULT_END_DATE);

    for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
        const currentDate = addDays(startDate, dayIndex);
        const date = toIsoDate(currentDate);

        SALESPEOPLE.forEach((salesperson, salespersonIndex) => {
            CATEGORY_OPTIONS.forEach((category, categoryIndex) => {
                const rhythm = (dayIndex + 1) * (salespersonIndex + 2) + (categoryIndex + 3) * 5;
                const appVisits = 72 + (rhythm % 36) + categoryIndex * 8 + salespersonIndex * 2;
                const tryOnsStarted = Math.round(appVisits * (0.54 + ((salespersonIndex + categoryIndex) % 4) * 0.03));
                const tryOnsCompleted = Math.round(tryOnsStarted * (0.68 + ((dayIndex + categoryIndex) % 4) * 0.03));
                const addedToCart = Math.round(tryOnsCompleted * (0.4 + ((salespersonIndex + dayIndex) % 3) * 0.05));
                const purchases = Math.max(1, Math.round(addedToCart * (0.52 + ((categoryIndex + salespersonIndex) % 3) * 0.06)));
                const ordersClosed = purchases;
                const unitsSold = ordersClosed + ((dayIndex + salespersonIndex + categoryIndex) % 3) + 1;
                const customers = Math.max(1, ordersClosed - ((salespersonIndex + categoryIndex) % 2));
                const tryOnsAssisted = tryOnsCompleted + 6 + (salespersonIndex % 4) * 3;
                const ratingAverage = clamp(
                    4 + (((salespersonIndex * 7 + dayIndex + categoryIndex) % 12) - 4) / 10,
                    3.7,
                    4.9,
                );
                const ratingCount = Math.max(2, ordersClosed + 2 + ((dayIndex + salespersonIndex) % 4));
                const campaign = CAMPAIGN_OPTIONS[(dayIndex + salespersonIndex + categoryIndex) % CAMPAIGN_OPTIONS.length];

                records.push({
                    date,
                    salespersonId: salesperson.id,
                    salespersonName: salesperson.name,
                    region: salesperson.region,
                    category,
                    campaign,
                    appVisits,
                    tryOnsStarted,
                    tryOnsCompleted,
                    addedToCart,
                    purchases,
                    ordersClosed,
                    unitsSold,
                    customers,
                    tryOnsAssisted,
                    ratingAverage,
                    ratingCount,
                });
            });
        });
    }

    mockRecordsCache = records.filter((record) => record.date <= toIsoDate(endDate));
    return mockRecordsCache;
}

function normalizeFilters(input?: Partial<SalesPerformanceFilters>) {
    const dateFrom = input?.dateFrom || DEFAULT_SALES_PERFORMANCE_FILTERS.dateFrom;
    const dateTo = input?.dateTo || DEFAULT_SALES_PERFORMANCE_FILTERS.dateTo;

    const safeStart = dateFrom <= dateTo ? dateFrom : dateTo;
    const safeEnd = dateTo >= dateFrom ? dateTo : dateFrom;

    return {
        dateFrom: safeStart,
        dateTo: safeEnd,
        salespeople: Array.from(new Set((input?.salespeople || []).filter(Boolean))),
        region: input?.region || "all",
        category: input?.category || "all",
        campaign: input?.campaign || "all",
    };
}

function filterRecords(records: DailyPerformanceRecord[], filters: SalesPerformanceFilters) {
    return records.filter((record) => {
        if (record.date < filters.dateFrom || record.date > filters.dateTo) {
            return false;
        }

        if (filters.salespeople.length > 0 && !filters.salespeople.includes(record.salespersonId)) {
            return false;
        }

        if (filters.region !== "all" && record.region !== filters.region) {
            return false;
        }

        if (filters.category !== "all" && record.category !== filters.category) {
            return false;
        }

        if (filters.campaign !== "all" && record.campaign !== filters.campaign) {
            return false;
        }

        return true;
    });
}

function buildPreviousPeriodFilters(filters: SalesPerformanceFilters): SalesPerformanceFilters {
    const rangeLength = dateDiffInDays(filters.dateFrom, filters.dateTo);
    const previousEnd = addDays(parseDate(filters.dateFrom), -1);
    const previousStart = addDays(previousEnd, -(rangeLength - 1));

    return {
        ...filters,
        dateFrom: toIsoDate(previousStart),
        dateTo: toIsoDate(previousEnd),
    };
}

function aggregateTotals(records: DailyPerformanceRecord[]) {
    return records.reduce(
        (totals, record) => {
            totals.unitsSold += record.unitsSold;
            totals.ordersClosed += record.ordersClosed;
            totals.customers += record.customers;
            totals.tryOnsCompleted += record.tryOnsCompleted;
            totals.purchases += record.purchases;
            totals.tryOnsAssisted += record.tryOnsAssisted;
            totals.ratingWeighted += record.ratingAverage * record.ratingCount;
            totals.ratingCount += record.ratingCount;
            return totals;
        },
        {
            unitsSold: 0,
            ordersClosed: 0,
            customers: 0,
            tryOnsCompleted: 0,
            purchases: 0,
            tryOnsAssisted: 0,
            ratingWeighted: 0,
            ratingCount: 0,
        },
    );
}

function buildKpis(
    currentRecords: DailyPerformanceRecord[],
    previousRecords: DailyPerformanceRecord[],
    activeRepCount: number,
) {
    const currentTotals = aggregateTotals(currentRecords);
    const previousTotals = aggregateTotals(previousRecords);

    const currentConversion = conversionRate(currentTotals.purchases, currentTotals.tryOnsCompleted);
    const previousConversion = conversionRate(previousTotals.purchases, previousTotals.tryOnsCompleted);
    const currentItemsPerOrder = averageItemsPerOrder(currentTotals.unitsSold, currentTotals.ordersClosed);
    const previousItemsPerOrder = averageItemsPerOrder(previousTotals.unitsSold, previousTotals.ordersClosed);
    const currentUnitsPerRep = averageUnitsPerRep(currentTotals.unitsSold, activeRepCount);
    const previousUnitsPerRep = averageUnitsPerRep(
        previousTotals.unitsSold,
        activeRepCount || SALESPEOPLE.length,
    );
    const currentRating = averageRating(currentTotals.ratingWeighted, currentTotals.ratingCount);
    const previousRating = averageRating(previousTotals.ratingWeighted, previousTotals.ratingCount);

    const withTrend = (current: number, previous: number): Pick<SalesPerformanceKpi, "changePct" | "trend"> => {
        const changePct = percentageChange(current, previous);
        if (changePct > 0.1) {
            return { changePct, trend: "up" };
        }
        if (changePct < -0.1) {
            return { changePct, trend: "down" };
        }
        return { changePct: 0, trend: "flat" };
    };

    return [
        {
            key: "unitsSold",
            label: "Total Units Sold",
            value: currentTotals.unitsSold,
            format: "integer",
            ...withTrend(currentTotals.unitsSold, previousTotals.unitsSold),
        },
        {
            key: "orders",
            label: "Total Orders",
            value: currentTotals.ordersClosed,
            format: "integer",
            ...withTrend(currentTotals.ordersClosed, previousTotals.ordersClosed),
        },
        {
            key: "customers",
            label: "Total Customers",
            value: currentTotals.customers,
            format: "integer",
            ...withTrend(currentTotals.customers, previousTotals.customers),
        },
        {
            key: "tryOnsCompleted",
            label: "Virtual Try-Ons Completed",
            value: currentTotals.tryOnsCompleted,
            format: "integer",
            ...withTrend(currentTotals.tryOnsCompleted, previousTotals.tryOnsCompleted),
        },
        {
            key: "conversionRate",
            label: "Conversion Rate",
            value: currentConversion,
            format: "percentage",
            ...withTrend(currentConversion, previousConversion),
        },
        {
            key: "avgItemsPerOrder",
            label: "Average Items per Order",
            value: currentItemsPerOrder,
            format: "decimal",
            ...withTrend(currentItemsPerOrder, previousItemsPerOrder),
        },
        {
            key: "unitsSoldPerRep",
            label: "Units Sold per Rep",
            value: currentUnitsPerRep,
            format: "decimal",
            ...withTrend(currentUnitsPerRep, previousUnitsPerRep),
        },
        {
            key: "avgCustomerRating",
            label: "Avg Customer Rating",
            value: currentRating,
            format: "decimal",
            ...withTrend(currentRating, previousRating),
        },
    ];
}

function buildLeaderboardRows(records: DailyPerformanceRecord[]) {
    const bySalesperson = new Map<string, LeaderboardAccumulator>();

    records.forEach((record) => {
        const existing = bySalesperson.get(record.salespersonId) || {
            salespersonId: record.salespersonId,
            salespersonName: record.salespersonName,
            region: record.region,
            unitsSold: 0,
            ordersClosed: 0,
            conversionRate: 0,
            tryOnsAssisted: 0,
            purchases: 0,
            tryOnsCompleted: 0,
        };

        existing.unitsSold += record.unitsSold;
        existing.ordersClosed += record.ordersClosed;
        existing.tryOnsAssisted += record.tryOnsAssisted;
        existing.purchases += record.purchases;
        existing.tryOnsCompleted += record.tryOnsCompleted;

        bySalesperson.set(record.salespersonId, existing);
    });

    return Array.from(bySalesperson.values())
        .map((row) => ({
            salespersonId: row.salespersonId,
            salespersonName: row.salespersonName,
            region: row.region,
            unitsSold: row.unitsSold,
            ordersClosed: row.ordersClosed,
            conversionRate: conversionRate(row.purchases, row.tryOnsCompleted),
            tryOnsAssisted: row.tryOnsAssisted,
        }))
        .sort((left, right) => right.unitsSold - left.unitsSold);
}

function buildFunnelStages(records: DailyPerformanceRecord[]) {
    const totals = records.reduce(
        (accumulator, record) => {
            accumulator.appVisits += record.appVisits;
            accumulator.tryOnsStarted += record.tryOnsStarted;
            accumulator.tryOnsCompleted += record.tryOnsCompleted;
            accumulator.addedToCart += record.addedToCart;
            accumulator.purchases += record.purchases;
            return accumulator;
        },
        {
            appVisits: 0,
            tryOnsStarted: 0,
            tryOnsCompleted: 0,
            addedToCart: 0,
            purchases: 0,
        },
    );

    const stages = [
        { stage: "App Visit", count: totals.appVisits },
        { stage: "Virtual Try-On Started", count: totals.tryOnsStarted },
        { stage: "Try-On Completed", count: totals.tryOnsCompleted },
        { stage: "Added to Cart", count: totals.addedToCart },
        { stage: "Purchased", count: totals.purchases },
    ];

    return stages.map((stage, index) => {
        const nextCount = stages[index + 1]?.count ?? stage.count;
        const dropOffPct = stage.count === 0 ? 0 : round(((stage.count - nextCount) / stage.count) * 100, 1);
        return {
            ...stage,
            dropOffPct: index === stages.length - 1 ? 0 : clamp(dropOffPct, 0, 100),
        };
    });
}

function buildCategoryRows(records: DailyPerformanceRecord[]) {
    const byCategory = new Map<string, SalesPerformanceCategoryRow & { purchases: number }>();

    records.forEach((record) => {
        const existing = byCategory.get(record.category) || {
            category: record.category,
            unitsSold: 0,
            tryOnsCompleted: 0,
            conversionRate: 0,
            purchases: 0,
        };

        existing.unitsSold += record.unitsSold;
        existing.tryOnsCompleted += record.tryOnsCompleted;
        existing.purchases += record.purchases;
        byCategory.set(record.category, existing);
    });

    return Array.from(byCategory.values())
        .map((row) => ({
            category: row.category,
            unitsSold: row.unitsSold,
            tryOnsCompleted: row.tryOnsCompleted,
            conversionRate: conversionRate(row.purchases, row.tryOnsCompleted),
        }))
        .sort((left, right) => right.unitsSold - left.unitsSold);
}

function buildTrendSeries(records: DailyPerformanceRecord[], granularity: "daily" | "weekly" | "monthly") {
    const groups = new Map<string, { unitsSold: number; purchases: number; tryOnsCompleted: number }>();

    records.forEach((record) => {
        const key =
            granularity === "daily"
                ? record.date
                : granularity === "weekly"
                  ? getIsoWeekLabel(record.date)
                  : getMonthLabel(record.date);

        const current = groups.get(key) || { unitsSold: 0, purchases: 0, tryOnsCompleted: 0 };
        current.unitsSold += record.unitsSold;
        current.purchases += record.purchases;
        current.tryOnsCompleted += record.tryOnsCompleted;
        groups.set(key, current);
    });

    return Array.from(groups.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([label, values]) => ({
            label,
            unitsSold: values.unitsSold,
            conversionRate: conversionRate(values.purchases, values.tryOnsCompleted),
        }));
}

function buildRadarRows(records: DailyPerformanceRecord[]) {
    const bySalesperson = new Map<string, RadarAccumulator>();

    records.forEach((record) => {
        const existing = bySalesperson.get(record.salespersonId) || {
            salespersonId: record.salespersonId,
            salespersonName: record.salespersonName,
            unitsSold: 0,
            conversionRate: 0,
            avgItemsPerOrder: 0,
            tryOnsAssisted: 0,
            customerRating: 0,
            ordersClosed: 0,
            purchases: 0,
            tryOnsCompleted: 0,
            ratingWeighted: 0,
            ratingCount: 0,
        };

        existing.unitsSold += record.unitsSold;
        existing.ordersClosed += record.ordersClosed;
        existing.tryOnsAssisted += record.tryOnsAssisted;
        existing.purchases += record.purchases;
        existing.tryOnsCompleted += record.tryOnsCompleted;
        existing.ratingWeighted += record.ratingAverage * record.ratingCount;
        existing.ratingCount += record.ratingCount;

        bySalesperson.set(record.salespersonId, existing);
    });

    return Array.from(bySalesperson.values())
        .map((row) => ({
            salespersonId: row.salespersonId,
            salespersonName: row.salespersonName,
            unitsSold: row.unitsSold,
            conversionRate: conversionRate(row.purchases, row.tryOnsCompleted),
            avgItemsPerOrder: averageItemsPerOrder(row.unitsSold, row.ordersClosed),
            tryOnsAssisted: row.tryOnsAssisted,
            customerRating: averageRating(row.ratingWeighted, row.ratingCount),
        }))
        .sort((left, right) => right.unitsSold - left.unitsSold)
        .slice(0, 5);
}

function buildPerformanceTableRows(records: DailyPerformanceRecord[]) {
    const bySalesperson = new Map<string, TableAccumulator>();

    records.forEach((record) => {
        const existing = bySalesperson.get(record.salespersonId) || {
            salespersonId: record.salespersonId,
            salespersonName: record.salespersonName,
            region: record.region,
            unitsSold: 0,
            ordersClosed: 0,
            conversionRate: 0,
            tryOnsAssisted: 0,
            avgItemsPerOrder: 0,
            customerRating: 0,
            purchases: 0,
            tryOnsCompleted: 0,
            ratingWeighted: 0,
            ratingCount: 0,
        };

        existing.unitsSold += record.unitsSold;
        existing.ordersClosed += record.ordersClosed;
        existing.tryOnsAssisted += record.tryOnsAssisted;
        existing.purchases += record.purchases;
        existing.tryOnsCompleted += record.tryOnsCompleted;
        existing.ratingWeighted += record.ratingAverage * record.ratingCount;
        existing.ratingCount += record.ratingCount;

        bySalesperson.set(record.salespersonId, existing);
    });

    return Array.from(bySalesperson.values())
        .map((row) => ({
            salespersonId: row.salespersonId,
            salespersonName: row.salespersonName,
            region: row.region,
            unitsSold: row.unitsSold,
            ordersClosed: row.ordersClosed,
            conversionRate: conversionRate(row.purchases, row.tryOnsCompleted),
            tryOnsAssisted: row.tryOnsAssisted,
            avgItemsPerOrder: averageItemsPerOrder(row.unitsSold, row.ordersClosed),
            customerRating: averageRating(row.ratingWeighted, row.ratingCount),
        }))
        .sort((left, right) => right.unitsSold - left.unitsSold);
}

export function buildSalesPerformanceResponse(input?: Partial<SalesPerformanceFilters>): SalesPerformanceResponse {
    const filters = normalizeFilters(input);
    const records = buildMockRecords();
    const filteredRecords = filterRecords(records, filters);
    const previousPeriodFilters = buildPreviousPeriodFilters(filters);
    const previousRecords = filterRecords(records, previousPeriodFilters);
    const activeRepCount =
        filters.salespeople.length > 0
            ? filters.salespeople.length
            : filters.region === "all"
              ? SALESPEOPLE.length
              : SALESPEOPLE.filter((salesperson) => salesperson.region === filters.region).length;

    return {
        meta: {
            generatedAt: new Date().toISOString(),
            framework: "React + ApexCharts",
        },
        filters: {
            applied: filters,
            options: {
                salespeople: SALESPEOPLE,
                regions: [{ label: "All Regions", value: "all" }, ...REGIONS.map((region) => ({ label: region, value: region }))],
                categories: [
                    { label: "All Categories", value: "all" },
                    ...CATEGORY_OPTIONS.map((category) => ({ label: category, value: category })),
                ],
                campaigns: [
                    { label: "All Campaigns", value: "all" },
                    ...CAMPAIGN_OPTIONS.map((campaign) => ({ label: campaign, value: campaign })),
                ],
            },
        },
        summary: {
            kpis: buildKpis(filteredRecords, previousRecords, activeRepCount),
        },
        leaderboard: {
            metricOptions: [
                { label: "Total Units Sold", value: "unitsSold" },
                { label: "Orders Closed", value: "ordersClosed" },
                { label: "Conversion Rate", value: "conversionRate" },
                { label: "Try-Ons Assisted", value: "tryOnsAssisted" },
            ],
            rows: buildLeaderboardRows(filteredRecords),
        },
        funnel: {
            stages: buildFunnelStages(filteredRecords),
        },
        categoryPerformance: {
            modeOptions: [
                { label: "Most Sold Categories", value: "sold" },
                { label: "Most Tried Categories", value: "tried" },
                { label: "Highest Conversion Categories", value: "conversion" },
            ],
            rows: buildCategoryRows(filteredRecords),
        },
        trends: {
            granularities: [
                { label: "Daily", value: "daily" },
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
            ],
            daily: buildTrendSeries(filteredRecords, "daily"),
            weekly: buildTrendSeries(filteredRecords, "weekly"),
            monthly: buildTrendSeries(filteredRecords, "monthly"),
        },
        radarComparison: {
            rows: buildRadarRows(filteredRecords),
        },
        performanceTable: {
            rows: buildPerformanceTableRows(filteredRecords),
        },
        empty: filteredRecords.length === 0,
    };
}

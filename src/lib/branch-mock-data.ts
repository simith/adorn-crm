import { readFile } from "fs/promises";
import path from "path";

import { BRANCH_CITIES, type BranchCityId } from "@/lib/branch-config";

let branchTemplateCache: any | null = null;
let analyticsTemplateCache: any | null = null;

function templatePath(filename: string) {
    return path.join(process.cwd(), "data", filename);
}

async function loadBranchTemplate() {
    if (branchTemplateCache) {
        return branchTemplateCache;
    }

    const raw = await readFile(templatePath("branch_bangalore.json"), "utf-8");
    branchTemplateCache = JSON.parse(raw);
    return branchTemplateCache;
}

async function loadAnalyticsTemplate() {
    if (analyticsTemplateCache) {
        return analyticsTemplateCache;
    }

    const raw = await readFile(templatePath("analytics_bangalore.json"), "utf-8");
    analyticsTemplateCache = JSON.parse(raw);
    return analyticsTemplateCache;
}

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function cityIndex(city: BranchCityId) {
    return BRANCH_CITIES.indexOf(city);
}

function cityMultiplier(city: BranchCityId) {
    return 0.88 + cityIndex(city) * 0.035;
}

function cityOffset(city: BranchCityId) {
    return cityIndex(city) + 1;
}

function scaleInteger(value: number, multiplier: number, extra = 0) {
    return Math.max(0, Math.round(value * multiplier + extra));
}

function scalePercent(value: number, delta: number) {
    return Math.max(1, Math.min(99, Math.round(value + delta)));
}

function scaleSeries(values: number[], multiplier: number, offset: number, divisor: number) {
    return values.map((value, index) => Math.max(1, Math.round(value * multiplier + ((index + offset) % 3) - divisor)));
}

const NEW_JOIN_NAMES = [
    "Aishwarya Rai",
    "Rohan Shetty",
    "Megha Bhat",
    "Nivedita Kamath",
    "Varun Pai",
];

const LOYAL_CUSTOMER_NAMES = [
    "Ananya Shenoy",
    "Vikram Bhat",
    "Meera Kamath",
    "Kavya Pai",
];

export async function getBranchDashboardData(city: BranchCityId) {
    const base = clone(await loadBranchTemplate());
    const multiplier = cityMultiplier(city);
    const offset = cityOffset(city);
    const tryOnSessions = scaleSeries(base.uniqueVisitors.series[0].values, multiplier, offset, 0);
    const conversions = scaleSeries(base.uniqueVisitors.series[1].values, multiplier * 0.92, offset + 1, 1).map(
        (value: number, index: number) => Math.min(value, Math.max(1, tryOnSessions[index] - 1)),
    );

    base.kpis = base.kpis.map((kpi: any, index: number) => ({
        ...kpi,
        value: scaleInteger(kpi.value, multiplier, offset * (index + 1) * 1250),
        changePercent: Number((kpi.changePercent + (offset % 4) * 0.6 - 0.8).toFixed(1)),
    }));

    base.monthlyTarget = {
        ...base.monthlyTarget,
        percent: scalePercent(base.monthlyTarget.percent, (offset % 5) - 2),
    };

    base.activeMembers = {
        ...base.activeMembers,
        count: scaleInteger(base.activeMembers.count, multiplier, offset * 210),
        changePercent: Number((base.activeMembers.changePercent + (offset % 3) * 0.5 - 0.4).toFixed(1)),
    };

    base.uniqueVisitors = {
        ...base.uniqueVisitors,
        series: [
            {
                name: "Try-On Sessions",
                values: tryOnSessions,
            },
            {
                name: "Conversions",
                values: conversions,
            },
        ],
    };

    base.newJoinMembers = NEW_JOIN_NAMES.map((name, index) => ({
        name,
        location: city,
        id: `${city.toLowerCase()}-${index + 1}`,
    }));

    base.latestTransactions = base.latestTransactions.map((transaction: any, index: number) => ({
        ...transaction,
        amount: scaleInteger(transaction.amount, multiplier, offset * (index + 1) * 500),
    }));

    base.updatedAt = new Date().toISOString();
    return base;
}

export async function getAnalyticsData(city: BranchCityId) {
    const base = clone(await loadAnalyticsTemplate());
    const multiplier = cityMultiplier(city);
    const offset = cityOffset(city);

    base.favorites = {
        ...base.favorites,
        items: base.favorites.items.map((item: any, index: number) => ({
            ...item,
            reviews: scaleInteger(item.reviews, multiplier, offset * (index + 1) * 9),
            likes: scaleInteger(item.likes, multiplier, offset * (index + 1) * 540),
            interestPercent: scalePercent(item.interestPercent, ((offset + index) % 5) - 2),
            totalSales: scaleInteger(item.totalSales, multiplier, offset * (index + 1) * 24),
            goalPercent: scalePercent(item.goalPercent, ((offset + index) % 4) - 1),
        })),
    };

    base.dailyTrendingMenus = {
        ...base.dailyTrendingMenus,
        items: base.dailyTrendingMenus.items.map((item: any, index: number) => ({
            ...item,
            price: scaleInteger(item.price, multiplier, offset * (index + 1) * 700),
            orders: scaleInteger(item.orders, multiplier, offset * (index + 1) * 2),
        })),
    };

    base.salesSummary = {
        ...base.salesSummary,
        metrics: base.salesSummary.metrics.map((metric: any, index: number) => ({
            ...metric,
            value: scaleInteger(metric.value, multiplier, offset * (index + 1) * 170),
        })),
    };

    base.loyalCustomers = {
        ...base.loyalCustomers,
        customers: LOYAL_CUSTOMER_NAMES.map((name, index) => ({
            name,
            orders: scaleInteger(base.loyalCustomers.customers[index]?.orders || 100, multiplier, offset * (index + 1) * 3),
        })),
    };

    base.bestSeller = {
        ...base.bestSeller,
        item: {
            ...base.bestSeller.item,
            price: scaleInteger(base.bestSeller.item.price, multiplier, offset * 900),
            likes: scaleInteger(base.bestSeller.item.likes, multiplier, offset * 600),
            sales: scaleInteger(base.bestSeller.item.sales, multiplier, offset * 16),
        },
    };

    base.updatedAt = new Date().toISOString();
    return base;
}

export async function getAllBranchDashboardData() {
    return Promise.all(BRANCH_CITIES.map((city) => getBranchDashboardData(city)));
}

export async function getAllAnalyticsData() {
    return Promise.all(BRANCH_CITIES.map((city) => getAnalyticsData(city)));
}

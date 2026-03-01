export const BRAND_NAME = "Abharan Jewellers";

export const BRANCH_CITIES = [
    "Udupi",
    "Mangaluru",
    "Shivamogga",
    "Kundapura",
    "Kumta",
    "Panaji",
    "Sagara",
    "Chikkamagaluru",
    "Hebri",
    "Karkala",
    "Belthangady",
] as const;

export const ALL_BRANCH_ID = "All" as const;
export const DEFAULT_BRANCH_ID = BRANCH_CITIES[0];

export type BranchCityId = (typeof BRANCH_CITIES)[number];
export type BranchId = BranchCityId | typeof ALL_BRANCH_ID;

export const BRANCH_OPTIONS = [
    ...BRANCH_CITIES.map((city) => ({ id: city, label: city })),
    { id: ALL_BRANCH_ID, label: "All Branches" },
] as const;

export function isBranchId(value: string): value is BranchId {
    return BRANCH_OPTIONS.some((branch) => branch.id === value);
}

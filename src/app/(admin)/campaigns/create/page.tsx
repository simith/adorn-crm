"use client";

import { CampaignCreateSkeleton } from "@/components/skeletons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Kpi = {
    label: string;
    value: number;
    unit?: string;
};

type TableRow = {
    name: string;
    email: string;
    lastVisit: string;
    lastPurchase: string;
    city: string;
};

type CustomerListData = {
    title: string;
    subtitle: string;
    query: {
        placeholder: string;
        actionLabel: string;
    };
    resultPreview?: {
        kpis: Kpi[];
        returningBreakdown: {
            returningPercent: number;
            newPercent: number;
        };
    };
    table?: {
        columns: string[];
        rows: TableRow[];
    };
    pagination?: {
        label: string;
        currentPage: number;
        totalPages: number;
    };
};

const AnimatedNumber = ({ target, duration = 800 }: { target: number; duration?: number }) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(easeOut * target));

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [target, duration]);

    return <span>{value.toLocaleString("en-IN")}</span>;
};

const CreateCampaignPage = () => {
    const router = useRouter();
    const [data, setData] = useState<CustomerListData | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [showResults, setShowResults] = useState(true); // Show results by default
    const [customerCount, setCustomerCount] = useState(4527);
    const [selectedSegment, setSelectedSegment] = useState("Choose customers");

    useEffect(() => {
        fetch("/api/customer-lists/customer_list_1")
            .then((res) => res.json())
            .then((body) => {
                if (body.data) {
                    setData(body.data);
                    setSearchQuery(body.data.query?.placeholder || "");
                }
            })
            .catch(() => setData(null))
            .finally(() => setIsPageLoading(false));
    }, []);

    if (isPageLoading) {
        return <CampaignCreateSkeleton />;
    }

    const fetchCustomerList = (listId: string) => {
        setIsLoading(true);
        fetch(`/api/customer-lists/${listId}`)
            .then((res) => res.json())
            .then((body) => {
                if (body.data) {
                    setData(body.data);
                    // Update search query with the placeholder from response
                    if (body.data.query?.placeholder) {
                        setSearchQuery(body.data.query.placeholder);
                    }
                    // Update customer count from KPIs if available
                    const activeCustomersKpi = body.data.resultPreview?.kpis?.find(
                        (kpi: { label: string }) => kpi.label === "Active Customers"
                    );
                    if (activeCustomersKpi) {
                        setCustomerCount(activeCustomersKpi.value);
                    }
                }
            })
            .catch(() => {
                // Keep existing data on error
            })
            .finally(() => {
                setIsLoading(false);
                setShowResults(true);
            });
    };

    const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedSegment(value);

        // Map segment to customer list endpoint
        if (value === "Customers who visiting in the last 7 days") {
            fetchCustomerList("customer_list_2");
        } else if (value === "Customers who bought a necklace in the last one month") {
            fetchCustomerList("customer_list_3");
        } else if (value === "Customers who bought for more than 1 Lakh in the last 6 months") {
            fetchCustomerList("customer_list_4");
        }
    };

    const handleGenerateList = () => {
        setIsLoading(true);
        const params = new URLSearchParams({ q: searchQuery });
        fetch(`/api/customer-lists/ai_search_list?${params}`)
            .then((res) => res.json())
            .then((body) => {
                if (body.data) {
                    setData(body.data);
                    // Update search query with the placeholder from AI response
                    if (body.data.query?.placeholder) {
                        setSearchQuery(body.data.query.placeholder);
                    }
                    // Update customer count from KPIs if available
                    const activeCustomersKpi = body.data.resultPreview?.kpis?.find(
                        (kpi: { label: string }) => kpi.label === "Active Customers"
                    );
                    if (activeCustomersKpi) {
                        setCustomerCount(activeCustomersKpi.value);
                    }
                }
            })
            .catch(() => {
                // Keep existing data on error
            })
            .finally(() => {
                setIsLoading(false);
                setShowResults(true);
            });
    };

    if (!data) {
        return (
            <div className="mt-6">
                <div className="h-32 animate-pulse rounded-box bg-base-200/60" />
            </div>
        );
    }

    return (
        <div className="mt-6 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-base-content">{data.title}</h1>
                <p className="mt-2 text-base-content/60">{data.subtitle}</p>
            </div>

            {/* Search Input */}
            <div className="card bg-base-100 shadow-md">
                <div className="card-body p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-1 items-center gap-3 rounded-lg border border-base-300 px-5 py-4">
                            <span className="iconify lucide--search text-base-content/40 size-6" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={data.query.placeholder}
                                className="flex-1 bg-transparent text-lg text-base-content outline-none"
                            />
                        </div>
                        <button
                            onClick={handleGenerateList}
                            disabled={isLoading || !searchQuery.trim()}
                            className="btn btn-primary px-10 py-3 text-lg">
                            {isLoading ? (
                                <span className="iconify lucide--loader-2 size-5 animate-spin" />
                            ) : (
                                data.query.actionLabel
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {showResults && (
                <div className="mt-8 space-y-6">
                    {/* Customer Segment Dropdown */}
                    <div className="card bg-base-100 shadow-md">
                        <div className="card-body p-6">
                            <label className="text-base-content/80 text-base font-medium">Customer Segment</label>
                            <select 
                                className="select select-bordered mt-3 w-full max-w-lg text-base"
                                value={selectedSegment}
                                onChange={handleSegmentChange}>
                                <option>Choose customers</option>
                                <option>Customers who visiting in the last 7 days</option>
                                <option>Customers who bought a necklace in the last one month</option>
                                <option>Customers who bought for more than 1 Lakh in the last 6 months</option>
                            </select>
                        </div>
                    </div>

                    {/* Result Preview Header */}
                    <h2 className="text-2xl font-bold text-base-content">Result Preview</h2>

                    {/* Stats Cards with Donut Chart */}
                    <div className="card bg-base-100 shadow-md">
                        <div className="card-body p-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                                {/* Active Customers */}
                                <div className="flex items-center gap-3 border-r border-base-200 p-3">
                                    <span className="size-3 rounded-full bg-amber-400" />
                                    <div>
                                        <p className="text-base-content/60 text-sm">Active Customers</p>
                                        <p className="text-2xl font-bold">
                                            <AnimatedNumber 
                                                target={data.resultPreview?.kpis?.find((k) => k.label === "Active Customers")?.value || 4527} 
                                            />
                                        </p>
                                    </div>
                                </div>
                                {/* New Customers */}
                                <div className="flex items-center gap-3 border-r border-base-200 p-3">
                                    <span className="size-3 rounded-full bg-emerald-400" />
                                    <div>
                                        <p className="text-base-content/60 text-sm">New Customers</p>
                                        <p className="text-2xl font-bold">
                                            <AnimatedNumber 
                                                target={data.resultPreview?.kpis?.find((k) => k.label === "New Customers")?.value || 812} 
                                            />
                                        </p>
                                    </div>
                                </div>
                                {/* Returning Customers */}
                                <div className="flex items-center gap-3 border-r border-base-200 p-3">
                                    <span className="size-3 rounded-full bg-red-400" />
                                    <div>
                                        <p className="text-base-content/60 text-sm">Returning Customers</p>
                                        <p className="text-2xl font-bold">
                                            <AnimatedNumber 
                                                target={data.resultPreview?.kpis?.find((k) => k.label === "Returning Customers")?.value || 3715} 
                                            />
                                        </p>
                                    </div>
                                </div>
                                {/* Returning Rate */}
                                <div className="flex items-center gap-3 border-r border-base-200 p-3">
                                    <span className="size-3 rounded-full bg-blue-500" />
                                    <div>
                                        <p className="text-base-content/60 text-sm">Returning</p>
                                        <p className="text-2xl font-bold">
                                            {data.resultPreview?.returningBreakdown?.returningPercent || 82}%
                                        </p>
                                    </div>
                                </div>
                                {/* Donut Chart */}
                                <div className="flex items-center justify-center gap-6 p-3">
                                    <div className="relative flex items-center justify-center">
                                        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="14"
                                                className="text-base-200"
                                            />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="14"
                                                strokeLinecap="round"
                                                strokeDasharray={251.2}
                                                strokeDashoffset={251.2 - (251.2 * (data.resultPreview?.returningBreakdown?.returningPercent || 82)) / 100}
                                                className="text-primary transition-all duration-700 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-2xl font-bold">
                                                {data.resultPreview?.returningBreakdown?.returningPercent || 82}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="size-4 rounded-full bg-primary" />
                                            <span className="text-base text-base-content/70">Returning</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="size-4 rounded-full bg-base-300" />
                                            <span className="text-base text-base-content/70">New</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex items-center justify-between border-t border-base-200 pt-4">
                                <div className="flex gap-3">
                                    <button className="btn btn-primary btn-sm">Add to CRM</button>
                                    <button className="btn btn-outline btn-sm">Save List</button>
                                </div>
                                <button className="btn btn-outline btn-sm">Download CSV</button>
                            </div>
                        </div>
                    </div>

                    {/* Customer Table */}
                    <div className="card bg-base-100 shadow-md">
                        <div className="card-body p-0">
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Last Visit</th>
                                            <th>Last Purchase</th>
                                            <th>City</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.table?.rows?.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.name}</td>
                                                <td>{row.email}</td>
                                                <td>{row.lastVisit}</td>
                                                <td>{row.lastPurchase || "-"}</td>
                                                <td>{row.city}</td>
                                            </tr>
                                        )) || (
                                            // Fallback static data if no table data
                                            <>
                                                <tr>
                                                    <td>Aisha Sharma</td>
                                                    <td>aisha.sharma@email.com</td>
                                                    <td>Apr 21, 2024</td>
                                                    <td>Gold Necklace Set, $850</td>
                                                    <td>Mumbai</td>
                                                </tr>
                                                <tr>
                                                    <td>Ravi Kapoor</td>
                                                    <td>ravi.kapoor@email.com</td>
                                                    <td>Apr 20, 2024</td>
                                                    <td>Diamond Earrings, $1,200</td>
                                                    <td>Delhi</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <p className="text-base-content/60 text-sm">{data.pagination?.label || "Showing 1 to 8 of 4,527"}</p>
                        <div className="flex items-center gap-2">
                            <button className="btn btn-outline btn-sm" disabled>
                                Previous
                            </button>
                            <button className="btn btn-primary btn-sm">1</button>
                            <button className="btn btn-ghost btn-sm">2</button>
                            <button className="btn btn-ghost btn-sm">3</button>
                            <button className="btn btn-outline btn-sm">Next</button>
                        </div>
                        <button className="btn btn-outline btn-sm">Download CSV</button>
                        <button 
                            className="btn btn-primary"
                            onClick={() => router.push("/campaigns/builder")}>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateCampaignPage;

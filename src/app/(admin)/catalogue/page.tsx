"use client";

import { CatalogueSkeleton } from "@/components/skeletons";
import { useEffect, useState, useMemo } from "react";

interface CatalogueItem {
    product_id: string;
    image: string;
    description: string;
    category: "necklaces_pendants" | "earrings" | "others";
}

interface CatalogueData {
    title: string;
    subtitle: string;
    items: CatalogueItem[];
}

type SortOption = "newest" | "code-asc" | "code-desc";
type FilterCategory = "all" | "necklaces_pendants" | "earrings";

const CataloguePage = () => {
    const [data, setData] = useState<CatalogueData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    useEffect(() => {
        const fetchCatalogue = async () => {
            try {
                const response = await fetch("/api/catalogue");
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch catalogue:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCatalogue();
    }, []);

    const filteredAndSortedItems = useMemo(() => {
        if (!data?.items) return [];

        let items = [...data.items];

        // Filter
        if (activeFilter !== "all") {
            items = items.filter((item) => item.category === activeFilter);
        }

        // Sort
        switch (sortBy) {
            case "code-asc":
                items.sort((a, b) => a.product_id.localeCompare(b.product_id));
                break;
            case "code-desc":
                items.sort((a, b) => b.product_id.localeCompare(a.product_id));
                break;
            case "newest":
            default:
                // Keep original order (assumed newest first)
                break;
        }

        return items;
    }, [data, activeFilter, sortBy]);

    const getCategoryCount = (category: FilterCategory) => {
        if (!data?.items) return 0;
        if (category === "all") return data.items.length;
        return data.items.filter((item) => item.category === category).length;
    };

    const getCategoryLabel = (category: FilterCategory) => {
        switch (category) {
            case "all":
                return `All (${getCategoryCount("all")})`;
            case "necklaces_pendants":
                return `Necklaces & Pendants (${getCategoryCount("necklaces_pendants")})`;
            case "earrings":
                return `Earrings (${getCategoryCount("earrings")})`;
        }
    };

    const extractProductName = (description: string) => {
        // Extract first sentence or first 4-5 words as product name
        const firstSentence = description.split(".")[0];
        const words = firstSentence.split(" ").slice(0, 5);
        return words.join(" ");
    };

    const getShortDescription = (description: string) => {
        // Remove the product name portion and return the rest
        const productName = extractProductName(description);
        return description.replace(productName, "").trim().replace(/^\.+\s*/, "");
    };

    if (isLoading) {
        return <CatalogueSkeleton />;
    }

    return (
        <div className="mt-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-base-content">
                    {data?.title || "Necklaces, Pendants & Earrings"}
                </h1>
                <p className="mt-2 text-lg text-base-content/60">
                    {data?.subtitle || "Browse our exclusive collection of necklaces, pendants and earrings."}
                </p>
            </div>

            {/* Controls Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {(["all", "necklaces_pendants", "earrings"] as FilterCategory[]).map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                activeFilter === category
                                    ? "bg-primary text-primary-content shadow-md"
                                    : "bg-base-200 text-base-content/70 hover:bg-base-300"
                            }`}>
                            {getCategoryLabel(category)}
                        </button>
                    ))}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-sm font-medium text-base-content/60">Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="select select-bordered select-sm w-40">
                        <option value="newest">Newest</option>
                        <option value="code-asc">Product Code (A-Z)</option>
                        <option value="code-desc">Product Code (Z-A)</option>
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndSortedItems.map((item) => (
                    <div
                        key={item.product_id}
                        className="group card bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div className="card-body p-0">
                            {/* Product Code Badge */}
                            <div className="px-4 pt-4">
                                <span className="text-sm font-semibold tracking-wider text-primary/80">
                                    #{item.product_id}
                                </span>
                            </div>

                            {/* Product Image */}
                            <div className="relative mx-4 mt-3 aspect-4/3 overflow-hidden rounded-lg bg-base-200">
                                <img
                                    src={item.image}
                                    alt={extractProductName(item.description)}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
                                    }}
                                />
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold leading-tight text-base-content group-hover:text-primary">
                                    {extractProductName(item.description)}
                                </h3>
                                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-base-content/60">
                                    {getShortDescription(item.description)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedItems.length === 0 && (
                <div className="mt-12 flex flex-col items-center justify-center py-16">
                    <div className="rounded-full bg-base-200 p-4">
                        <span className="iconify lucide--package-x size-8 text-base-content/40" />
                    </div>
                    <p className="mt-4 text-base-content/60">No products found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default CataloguePage;
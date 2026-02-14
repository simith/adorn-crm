"use client";

import "choices.js/public/assets/styles/choices.min.css";
import { useEffect, useRef } from "react";

const BRANCHES = [
    { id: "main", label: "Main Store" },
    { id: "downtown", label: "Downtown" },
    { id: "mall", label: "Mall Branch" },
    { id: "airport", label: "Airport Outlet" },
    { id: "online", label: "Online" },
];

export const TopbarBranchMenu = () => {
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        const select = selectRef.current;
        if (!select) return;
        import("choices.js").then(({ default: Choices }) => {
            new Choices(select, {
                itemSelectText: "",
                searchEnabled: true,
                searchPlaceholderValue: "Search branches...",
                noResultsText: "No branches found",
            });
        });
    }, []);

    return (
        <div className="min-w-52 w-56 [&_.choices]:w-full [&_.choices__inner]:min-h-9 [&_.choices__inner]:rounded-lg [&_.choices__inner]:bg-base-200/50 [&_.choices__inner]:text-sm">
            <select ref={selectRef} aria-label="Select branch" defaultValue="main">
                {BRANCHES.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

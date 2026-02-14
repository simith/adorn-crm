"use client";

import "choices.js/public/assets/styles/choices.min.css";
import { useEffect, useRef } from "react";

import { BRANCH_OPTIONS, useBranch, type BranchId } from "@/contexts/branch";

export const TopbarBranchMenu = () => {
    const { branch, setBranch } = useBranch();
    const selectRef = useRef<HTMLSelectElement>(null);

    const choicesRef = useRef<{ destroy: () => void } | null>(null);

    useEffect(() => {
        const select = selectRef.current;
        if (!select) return;

        const handleChange = () => {
            const value = select.value as BranchId;
            if (BRANCH_OPTIONS.some((b) => b.id === value)) setBranch(value);
        };

        import("choices.js").then(({ default: Choices }) => {
            choicesRef.current = new Choices(select, {
                itemSelectText: "",
                searchEnabled: true,
                searchPlaceholderValue: "Search branches...",
                noResultsText: "No branches found",
            });
            select.addEventListener("change", handleChange);
        });

        return () => {
            select.removeEventListener("change", handleChange);
            if (choicesRef.current) {
                choicesRef.current.destroy();
                choicesRef.current = null;
            }
        };
    }, [setBranch]);

    return (
        <div className="branch-select min-w-52 w-56 [&_.choices]:w-full [&_.choices__inner]:min-h-9 [&_.choices__inner]:rounded-lg [&_.choices__inner]:bg-base-200 [&_.choices__inner]:text-sm [&_.choices__inner]:border-l-2 [&_.choices__inner]:border-l-primary">
            <select ref={selectRef} aria-label="Select branch" defaultValue={branch}>
                {BRANCH_OPTIONS.map((b) => (
                    <option key={b.id} value={b.id}>
                        {b.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

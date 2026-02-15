"use client";

import { useEffect, useState } from "react";

import { useBranch } from "@/contexts/branch";

type Transaction = {
    customer: string;
    date: string;
    amount: number;
    currency?: string;
    status: string;
};

type BranchData = {
    latestTransactions?: Transaction[];
};

function formatAmount(amount: number, currency = "INR") {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    if (s === "approved")
        return <span className="badge badge-soft badge-success badge-sm">{status}</span>;
    if (s === "pending")
        return <span className="badge badge-soft badge-info badge-sm">{status}</span>;
    if (s === "rejected")
        return <span className="badge badge-soft badge-error badge-sm">{status}</span>;
    return <span className="badge badge-soft badge-neutral badge-sm">{status}</span>;
}

export const CustomerDealsCard = () => {
    const { branch } = useBranch();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ name: branch });
        fetch(`/api/branch?${params}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load");
                return res.json();
            })
            .then((body: { data?: BranchData }) => {
                setTransactions(body.data?.latestTransactions ?? []);
            })
            .catch(() => setTransactions([]))
            .finally(() => setLoading(false));
    }, [branch]);

    return (
        <div className="card rounded-box border border-base-200 bg-base-100 shadow-sm">
            <div className="card-body p-4">
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-base font-bold text-base-content">Latest Transactions</h2>
                    <button
                        type="button"
                        className="btn btn-ghost btn-circle btn-sm shrink-0"
                        aria-label="More options"
                    >
                        <span className="iconify lucide--more-horizontal size-5 text-base-content/70" />
                    </button>
                </div>
                <div className="mt-2 overflow-x-auto">
                    <table className="table table-pin-rows">
                        <thead>
                            <tr className="text-base-content/60">
                                <th className="font-medium">Customer</th>
                                <th className="font-medium">Date</th>
                                <th className="font-medium">Amount</th>
                                <th className="font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td><div className="skeleton h-4 w-24" /></td>
                                        <td><div className="skeleton h-4 w-20" /></td>
                                        <td><div className="skeleton h-4 w-16" /></td>
                                        <td><div className="skeleton h-6 w-16 rounded-full" /></td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-sm text-base-content/60">
                                        No transactions.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx, idx) => (
                                    <tr key={idx} className="border-base-200">
                                        <td className="font-medium text-base-content">{tx.customer}</td>
                                        <td className="text-base-content/80">{tx.date}</td>
                                        <td className="text-base-content/80">{formatAmount(tx.amount, tx.currency)}</td>
                                        <td><StatusBadge status={tx.status} /></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

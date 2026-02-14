"use client";

import type { LeadRow } from "./leads-data";

export const LeadsTable = ({ data }: { data: LeadRow[] }) => {
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Joined On</th>
                    <th>Last Visited</th>
                    <th>Total Spend</th>
                    <th>City</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row) => (
                    <tr key={row.id}>
                        <td className="font-medium">{row.customer}</td>
                        <td className="text-base-content/80">{row.email}</td>
                        <td>{row.joinedOn}</td>
                        <td>{row.lastVisited}</td>
                        <td>{row.totalSpend}</td>
                        <td>{row.city}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

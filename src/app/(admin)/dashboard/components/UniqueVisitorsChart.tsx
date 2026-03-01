"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

import { LoadingEffect } from "@/components/LoadingEffect";

const ApexCharts = dynamic(() => import("react-apexcharts"), {
    ssr: false,
    loading: () => <LoadingEffect height={250} />,
});

type UniqueVisitorsData = {
    series: { name: string; values: number[] }[];
    labels: string[];
};

export const UniqueVisitorsChart = ({ data }: { data: UniqueVisitorsData }) => {
    const chartOptions: ApexOptions = {
        chart: {
            height: 250,
            type: "bar",
            background: "transparent",
            toolbar: {
                show: false,
            },
            animations: {
                enabled: true,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "52%",
                borderRadius: 6,
            },
        },
        colors: ["#1f7a5a", "#c58b2a"],
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "right",
            labels: {
                colors: "#6b7280",
            },
        },
        series: data.series.map((s) => ({
            name: s.name,
            data: s.values,
        })),
        xaxis: {
            categories: data.labels,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: "#9ca3af",
                    fontSize: "12px",
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#9ca3af",
                    fontSize: "12px",
                },
            },
        },
        grid: {
            borderColor: "#f1f5f9",
            padding: {
                left: 0,
                right: 0,
            },
        },
        tooltip: {
            enabled: true,
            shared: true,
            intersect: false,
        },
    };

    return (
        <ApexCharts
            options={chartOptions}
            height={chartOptions.chart?.height}
            type="bar"
            series={chartOptions.series}
        />
    );
};

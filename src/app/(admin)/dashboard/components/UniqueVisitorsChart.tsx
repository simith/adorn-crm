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
            type: "line",
            background: "transparent",
            toolbar: {
                show: false,
            },
            animations: {
                enabled: true,
            },
        },
        stroke: {
            curve: "straight",
            width: 2,
        },
        colors: ["#3b82f6", "#34d399"], // blue-500, emerald-400
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
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
            show: false,
        },
        grid: {
            show: false,
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
            type="line"
            series={chartOptions.series}
        />
    );
};

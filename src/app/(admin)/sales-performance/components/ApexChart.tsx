"use client";

import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
    loading: () => <div className="h-full min-h-72 animate-pulse rounded-2xl bg-base-200/60" />,
});

type ApexChartProps = {
    type: "bar" | "line" | "radar";
    height: number;
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    options: ApexOptions;
};

export const ApexChart = ({ type, height, series, options }: ApexChartProps) => {
    return <ReactApexChart type={type} height={height} series={series} options={options} />;
};

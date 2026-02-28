"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

import { LoadingEffect } from "@/components/LoadingEffect";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
    loading: () => <LoadingEffect className="rounded-box h-full min-h-[240px] w-full" />,
});

type ApexChartProps = {
    type: "line" | "bar" | "radar";
    height: number;
    options: ApexOptions;
    series: NonNullable<ApexOptions["series"]>;
};

export const ApexChart = ({ type, height, options, series }: ApexChartProps) => {
    return <ReactApexChart type={type} height={height} options={options} series={series} />;
};

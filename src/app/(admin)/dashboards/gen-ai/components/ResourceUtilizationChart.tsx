"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

import { LoadingEffect } from "@/components/LoadingEffect";

const ApexCharts = dynamic(() => import("react-apexcharts"), {
    ssr: false,
    loading: () => <LoadingEffect height={chartOptions.chart?.height} />,
});

const chartOptions: ApexOptions = {
    chart: {
        type: "treemap",
        height: 275,
        background: "transparent",
        toolbar: { show: false },
    },
    plotOptions: {
        treemap: {
            distributed: true,
            enableShades: false,
            borderRadius: 8,
        },
    },
    dataLabels: {
        style: {
            colors: ["var(--color-base-content)"], // Blue text color
        },
    },
    stroke: {
        width: 4,
        colors: ["var(--color-base-100)"],
    },
    series: [
        {
            name: "AI Model Usage",
            data: [
                { x: "NeuraText", y: 48 },
                { x: "EchoWave", y: 44 },
                { x: "DeepScribe", y: 42 },
                { x: "SynthVoice", y: 40 },
                { x: "VisioGen", y: 34 },
                { x: "Cortex", y: 30 },
                { x: "Crunch", y: 28 },
            ],
        },
    ],
    colors: ["#1b7efda0", "#fd731ea0", "#a153ffa0", "#28ff87a0", "#ff29aaa0", "#ffb01da0", "#A0B5C6a0"],
    tooltip: {
        y: {
            formatter: (val) => `${val}% Usage`,
        },
    },
};

export const ResourceUtilizationChart = () => {
    return (
        <div className="mx-4 -mt-2">
            <ApexCharts
                options={chartOptions}
                height={chartOptions.chart?.height}
                type={chartOptions.chart?.type}
                series={chartOptions.series}></ApexCharts>
        </div>
    );
};

import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { ComponentPageTitle } from "@/components/ComponentPageTitle";

import { IrregularTimeSeriesAreaChart } from "./IrregularTimeSeriesAreaChart";
import { NegativeValueAreaChart } from "./NegativeValueAreaChart";
import { SelectionAreaChart } from "./SelectionAreaChart";
import { SplineAreaChart } from "./SplineAreaChart";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const ChartPage = () => {
    return (
        <>
            <ComponentPageTitle
                label="Apexcharts"
                title="Area Charts"
                description="A collection of dynamic area charts for visualizing trends, patterns, and data ranges"
            />
            <div className="bg-base-200/40 rounded-box mt-6 px-5 py-4 lg:mt-12">
                <p className="text-base-content/60 font-medium">Usage guidelines</p>
                <p className="mt-1">
                    <span className="me-1">- Plugin Documentation:</span>
                    <Link
                        href="https://apexcharts.com/javascript-chart-demos/area-charts/"
                        target="_blank"
                        className="text-primary">
                        Apexcharts
                    </Link>
                </p>
            </div>
            <p className="text-base-content/60 mt-6 font-medium">Demos</p>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="card card-border bg-base-100">
                    <div className="bg-base-200/30 rounded-t-box px-5 py-3 font-medium">Spline Area</div>
                    <div className="px-5 pt-5 pb-2">
                        <SplineAreaChart />
                    </div>
                </div>
                <div className="card card-border bg-base-100">
                    <div className="bg-base-200/30 rounded-t-box px-5 py-3 font-medium">Negative Value Area</div>
                    <div className="px-5 pt-5 pb-2">
                        <NegativeValueAreaChart />
                    </div>
                </div>
                <div className="card card-border bg-base-100">
                    <div className="bg-base-200/30 rounded-t-box px-5 py-3 font-medium">Irregular Time Series Area</div>
                    <div className="px-5 pt-5 pb-2">
                        <IrregularTimeSeriesAreaChart />
                    </div>
                </div>
                <div className="card card-border bg-base-100">
                    <div className="bg-base-200/30 rounded-t-box px-5 py-3 font-medium">Selection Area</div>
                    <div className="px-5 pt-5 pb-2">
                        <SelectionAreaChart />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChartPage;

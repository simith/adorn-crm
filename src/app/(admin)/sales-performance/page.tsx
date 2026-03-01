import type { Metadata } from "next";

import { SalesPerformanceDashboard } from "./SalesPerformanceDashboard";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const SalesPerformancePage = () => {
    return <SalesPerformanceDashboard />;
};

export default SalesPerformancePage;

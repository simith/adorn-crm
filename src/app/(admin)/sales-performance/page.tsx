import type { Metadata } from "next";

import { SalesPerformanceDashboard } from "./components/SalesPerformanceDashboard";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform | Sales Performance",
};

const SalesPerformancePage = () => {
    return <SalesPerformanceDashboard />;
};

export default SalesPerformancePage;

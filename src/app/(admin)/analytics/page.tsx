import { type Metadata } from "next";

import { JewelleryAnalyticsView } from "./components/JewelleryAnalyticsView";

export const metadata: Metadata = {
    title: "Jewellery Analytics",
};

const AnalyticsPage = () => {
    return <JewelleryAnalyticsView />;
};

export default AnalyticsPage;

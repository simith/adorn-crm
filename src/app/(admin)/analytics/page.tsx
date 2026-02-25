import { type Metadata } from "next";

import { JewelleryAnalyticsView } from "./components/JewelleryAnalyticsView";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const AnalyticsPage = () => {
    return <JewelleryAnalyticsView />;
};

export default AnalyticsPage;

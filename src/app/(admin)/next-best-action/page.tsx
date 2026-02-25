import type { Metadata } from "next";

import { NextBestActionApp } from "./NextBestActionApp";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const NextBestActionPage = () => {
    return (
        <div className="mt-6">
            <NextBestActionApp />
        </div>
    );
};

export default NextBestActionPage;

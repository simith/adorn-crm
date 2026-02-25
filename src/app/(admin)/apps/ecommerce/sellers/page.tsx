import type { Metadata } from "next";

import { SellerTable } from "./SellerTable";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const EcommerceSellers = () => {
    return (
        <div className="mt-6">
            <SellerTable />
        </div>
    );
};

export default EcommerceSellers;

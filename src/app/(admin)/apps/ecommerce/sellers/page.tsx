import type { Metadata } from "next";

import { SellerTable } from "./SellerTable";

export const metadata: Metadata = {
    title: "Sellers - Ecommerce",
};

const EcommerceSellers = () => {
    return (
        <div className="mt-6">
            <SellerTable />
        </div>
    );
};

export default EcommerceSellers;

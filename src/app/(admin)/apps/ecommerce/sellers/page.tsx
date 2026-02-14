import type { Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";

import { SellerTable } from "./SellerTable";

export const metadata: Metadata = {
    title: "Sellers - Ecommerce",
};

const EcommerceSellers = () => {
    return (
        <>
            <PageTitle title="Sellers" />

            <div className="mt-6">
                <SellerTable />
            </div>
        </>
    );
};

export default EcommerceSellers;

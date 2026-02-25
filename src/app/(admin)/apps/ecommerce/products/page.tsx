import type { Metadata } from "next";

import { ProductTable } from "./ProductTable";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const EcommerceProducts = () => {
    return (
        <div className="mt-6">
            <ProductTable />
        </div>
    );
};

export default EcommerceProducts;

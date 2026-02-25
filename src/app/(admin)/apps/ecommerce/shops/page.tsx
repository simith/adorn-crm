import type { Metadata } from "next";

import { ShopTable } from "./ShopTable";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const EcommerceShops = () => {
    return (
        <div className="mt-6">
            <ShopTable />
        </div>
    );
};

export default EcommerceShops;

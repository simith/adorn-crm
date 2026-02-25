import type { Metadata } from "next";

import { OrderTable } from "./OrderTable";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const EcommerceOrdersPage = () => {
    return (
        <div className="mt-6">
            <OrderTable />
        </div>
    );
};

export default EcommerceOrdersPage;

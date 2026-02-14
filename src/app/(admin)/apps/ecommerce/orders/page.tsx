import type { Metadata } from "next";

import { OrderTable } from "./OrderTable";

export const metadata: Metadata = {
    title: "Orders - Ecommerce",
};

const EcommerceOrdersPage = () => {
    return (
        <div className="mt-6">
            <OrderTable />
        </div>
    );
};

export default EcommerceOrdersPage;

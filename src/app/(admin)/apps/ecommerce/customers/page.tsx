import type { Metadata } from "next";

import { CustomerTable } from "./CustomerTable";

export const metadata: Metadata = {
    title: "Customers - Ecommerce",
};

const EcommerceCustomers = () => {
    return (
        <div className="mt-6">
            <CustomerTable />
        </div>
    );
};

export default EcommerceCustomers;

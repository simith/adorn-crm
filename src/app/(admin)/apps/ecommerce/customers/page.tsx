import type { Metadata } from "next";

import { CustomerTable } from "./CustomerTable";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const EcommerceCustomers = () => {
    return (
        <div className="mt-6">
            <CustomerTable />
        </div>
    );
};

export default EcommerceCustomers;

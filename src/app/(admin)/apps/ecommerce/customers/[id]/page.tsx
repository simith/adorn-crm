import { Metadata } from "next";
import React from "react";

import { EditCustomerForm } from "./EditCustomerForm";

export const metadata: Metadata = {
    title: "Edit Customer",
};

const EditCustomerPage = () => {
    return (
        <div className="mt-6">
            <EditCustomerForm />
        </div>
    );
};

export default EditCustomerPage;

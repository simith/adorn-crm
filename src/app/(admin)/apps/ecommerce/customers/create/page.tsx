import { Metadata } from "next";
import React from "react";

import { CreateCustomerForm } from "./CreateCustomerForm";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const CreateCustomerPage = () => {
    return (
        <div className="mt-6">
            <CreateCustomerForm />
        </div>
    );
};

export default CreateCustomerPage;

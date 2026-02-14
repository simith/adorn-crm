import { Metadata } from "next";
import React from "react";

import { EditSellerForm } from "./EditSellerForm";

export const metadata: Metadata = {
    title: "Edit Seller",
};

const EditSellerPage = () => {
    return (
        <div className="mt-6">
            <EditSellerForm />
        </div>
    );
};

export default EditSellerPage;

import { Metadata } from "next";
import React from "react";

import { EditProductForm } from "./EditProductForm";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const EditProductPage = () => {
    return (
        <div className="mt-6">
            <EditProductForm />
        </div>
    );
};

export default EditProductPage;

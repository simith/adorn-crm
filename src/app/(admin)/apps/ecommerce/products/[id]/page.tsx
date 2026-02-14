import { Metadata } from "next";
import React from "react";

import { EditProductForm } from "./EditProductForm";

export const metadata: Metadata = {
    title: "Edit Product",
};

const EditProductPage = () => {
    return (
        <div className="mt-6">
            <EditProductForm />
        </div>
    );
};

export default EditProductPage;

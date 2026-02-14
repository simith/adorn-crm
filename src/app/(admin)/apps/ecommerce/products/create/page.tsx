import { Metadata } from "next";
import React from "react";

import { CreateProductForm } from "./CreateProductForm";

export const metadata: Metadata = {
    title: "Create Product",
};

const CreateProductPage = () => {
    return (
        <div className="mt-6">
            <CreateProductForm />
        </div>
    );
};

export default CreateProductPage;

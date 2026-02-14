import { Metadata } from "next";
import React from "react";

import { PageTitle } from "@/components/PageTitle";

import { CreateProductForm } from "./CreateProductForm";

export const metadata: Metadata = {
    title: "Create Product",
};

const CreateProductPage = () => {
    return (
        <>
            <PageTitle title="Create Product" />
            <div className="mt-6">
                <CreateProductForm />
            </div>
        </>
    );
};

export default CreateProductPage;

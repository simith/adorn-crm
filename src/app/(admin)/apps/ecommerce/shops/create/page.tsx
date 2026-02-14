import { Metadata } from "next";
import React from "react";

import { PageTitle } from "@/components/PageTitle";

import { CreateShopForm } from "./CreateShopForm";

export const metadata: Metadata = {
    title: "Create Shop",
};

const CreateShopPage = () => {
    return (
        <>
            <PageTitle title="Create Shop" />
            <div className="mt-6">
                <CreateShopForm />
            </div>
        </>
    );
};

export default CreateShopPage;

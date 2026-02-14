import { Metadata } from "next";
import React from "react";

import { PageTitle } from "@/components/PageTitle";

import { EditShopForm } from "./EditShopForm";

export const metadata: Metadata = {
    title: "Edit Shop",
};

const EditShopPage = () => {
    return (
        <>
            <PageTitle title="Edit Shop" />
            <div className="mt-6">
                <EditShopForm />
            </div>
        </>
    );
};

export default EditShopPage;

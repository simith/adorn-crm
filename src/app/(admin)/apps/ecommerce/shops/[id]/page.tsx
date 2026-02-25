import { Metadata } from "next";
import React from "react";

import { EditShopForm } from "./EditShopForm";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const EditShopPage = () => {
    return (
        <div className="mt-6">
            <EditShopForm />
        </div>
    );
};

export default EditShopPage;

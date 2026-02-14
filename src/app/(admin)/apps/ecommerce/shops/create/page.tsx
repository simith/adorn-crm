import { Metadata } from "next";
import React from "react";

import { CreateShopForm } from "./CreateShopForm";

export const metadata: Metadata = {
    title: "Create Shop",
};

const CreateShopPage = () => {
    return (
        <div className="mt-6">
            <CreateShopForm />
        </div>
    );
};

export default CreateShopPage;

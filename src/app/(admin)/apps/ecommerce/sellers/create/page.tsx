import { Metadata } from "next";
import React from "react";

import { CreateSellerForm } from "./CreateSellerForm";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const CreateSellerPage = () => {
    return (
        <div className="mt-6">
            <CreateSellerForm />
        </div>
    );
};

export default CreateSellerPage;

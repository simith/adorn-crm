import type { Metadata } from "next";

import { AiLibraryTable } from "./LibraryTable";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const AiLibraryPage = () => {
    return (
        <div className="mt-6">
            <AiLibraryTable />
        </div>
    );
};

export default AiLibraryPage;

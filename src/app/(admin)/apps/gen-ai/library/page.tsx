import type { Metadata } from "next";

import { AiLibraryTable } from "./LibraryTable";

export const metadata: Metadata = {
    title: "Ai Library",
};

const AiLibraryPage = () => {
    return (
        <div className="mt-6">
            <AiLibraryTable />
        </div>
    );
};

export default AiLibraryPage;

import type { Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";

import { AiLibraryTable } from "./LibraryTable";

export const metadata: Metadata = {
    title: "Ai Library",
};

const AiLibraryPage = () => {
    return (
        <>
            <PageTitle title="Library" />
            <div className="mt-6">
                <AiLibraryTable />
            </div>
        </>
    );
};

export default AiLibraryPage;

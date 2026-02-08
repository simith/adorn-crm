import type { Metadata } from "next";

import { ComponentPageTitle } from "@/components/ComponentPageTitle";

import { CommandDemo } from "./CommandDemo";
import { TextDemo } from "./TextDemo";

export const metadata: Metadata = {
    title: "Clipboard - Advanced",
};

const ClipboardPage = () => {
    return (
        <div>
            <ComponentPageTitle
                label="Interactions"
                title="Clipboard"
                description="Copy text to clipboard instantly with simple triggers and command-based interactions"
            />
            <p className="text-base-content/60 mt-6 font-medium lg:mt-12">Demos</p>
            <div className="mt-6 space-y-6">
                <div className="bg-base-100 card card-border">
                    <div className="bg-base-200/30 rounded-t-box px-5 py-3 font-medium">Text</div>
                    <div className="flex items-center justify-center p-6">
                        <TextDemo />
                    </div>
                </div>
                <div className="bg-base-100 card card-border">
                    <div className="bg-base-200/30 rounded-t-box px-5 py-3 font-medium">Command</div>
                    <div className="flex items-center justify-center p-6">
                        <CommandDemo />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClipboardPage;

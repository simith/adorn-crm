import type { Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";

import { ChatApp } from "./ChatApp";

export const metadata: Metadata = {
    title: "Chat",
};

const ChatPage = () => {
    return (
        <>
            <PageTitle title="Chat" />
            <div className="mt-6">
                <ChatApp />
            </div>
        </>
    );
};

export default ChatPage;

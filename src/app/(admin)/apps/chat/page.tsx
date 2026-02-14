import type { Metadata } from "next";

import { ChatApp } from "./ChatApp";

export const metadata: Metadata = {
    title: "Chat",
};

const ChatPage = () => {
    return (
        <div className="mt-6">
            <ChatApp />
        </div>
    );
};

export default ChatPage;

import type { Metadata } from "next";

import { ChatApp } from "./ChatApp";

export const metadata: Metadata = {
    title: "Adorn Jewellery Platform",
};

const ChatPage = () => {
    return (
        <div className="mt-6">
            <ChatApp />
        </div>
    );
};

export default ChatPage;

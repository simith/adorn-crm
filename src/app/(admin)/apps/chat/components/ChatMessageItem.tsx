import { IChatItem } from "./ChatItem";

export type MessageStatus = "sent" | "delivered" | "read";

export type IChatMessageItem = {
    message: string;
    sendAt: string;
    sender: "me" | "other";
    status?: MessageStatus;
    type?: "text" | "image";
    image?: string;
};

const TickIcon = ({ status }: { status?: MessageStatus }) => {
    if (!status) return null;
    const isRead = status === "read";
    const isDelivered = status === "delivered" || isRead;
    const colorClass = isRead ? "text-[#0088ea]" : "text-[#667781]";
    return (
        <span className={`inline-flex shrink-0 size-4 ${colorClass}`} aria-hidden>
            {isDelivered ? (
                <span className="iconify lucide--check-check size-4" />
            ) : (
                <span className="iconify lucide--check size-4" />
            )}
        </span>
    );
};

export const ChatMessageItem = ({ chat, message }: { chat: IChatItem; message: IChatMessageItem }) => {
    const isMe = message.sender === "me";
    const isImage = message.type === "image";

    return (
        <div>
            <div className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                <div className="chat-image avatar">
                    <div className="w-10">
                        <img
                            src={isMe ? "/images/avatars/1.png" : chat.image}
                            className="mask mask-squircle bg-base-200 p-0.5"
                            alt=""
                        />
                    </div>
                </div>
                {isImage ? (
                    <div className="chat-bubble bg-transparent border-0 shadow-none p-0 max-w-[280px]">
                        <img
                            src={message.image}
                            alt="Campaign"
                            className="rounded-lg shadow-md"
                        />
                        <div className="mt-1 flex items-center justify-end gap-1">
                            <span className="text-gray-600 text-[11px]">{message.sendAt}</span>
                            {isMe && <TickIcon status={message.status ?? "sent"} />}
                        </div>
                    </div>
                ) : (
                    <div
                        className={`chat-bubble text-sm max-w-[85%] ${
                            isMe
                                ? "bg-[#d9fdd3] text-gray-900 border border-[#b8e6b0]"
                                : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                        }`}>
                        <p className="break-words">{message.message}</p>
                        <div className="mt-0.5 flex flex-nowrap items-center justify-end gap-1.5">
                            <span className="text-gray-600 text-[11px] shrink-0">{message.sendAt}</span>
                            {isMe && <TickIcon status={message.status ?? "sent"} />}
                        </div>
                    </div>
                )}
                {!isMe && !isImage && <div className="chat-footer text-gray-600 text-xs">{message.sendAt}</div>}
            </div>
        </div>
    );
};

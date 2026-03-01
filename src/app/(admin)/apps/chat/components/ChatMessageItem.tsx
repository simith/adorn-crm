import { IChatItem } from "./ChatItem";

export type MessageStatus = "sent" | "delivered" | "read";

export type IChatMessageItem = {
    message: string;
    sendAt: string;
    sender: "me" | "other";
    imageUrl?: string;
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
        <span className={`inline-flex size-4 shrink-0 ${colorClass}`} aria-hidden>
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
    const imageSrc = message.imageUrl || message.image;
    const hasImage = Boolean(imageSrc);
    const hasText = Boolean(message.message.trim());

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
                <div
                    className={`chat-bubble text-sm max-w-[85%] ${
                        hasImage
                            ? "bg-transparent border-0 shadow-none p-0"
                            : isMe
                              ? "bg-[#d9fdd3] text-gray-900 border border-[#b8e6b0]"
                              : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                    }`}>
                    {hasImage && (
                        <img
                            src={imageSrc}
                            alt={hasText ? message.message : "Chat attachment"}
                            className="max-w-[280px] rounded-lg shadow-md"
                        />
                    )}
                    {hasText && (
                        <p
                            className={`break-words ${
                                hasImage
                                    ? "mt-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm"
                                    : ""
                            }`}>
                            {message.message}
                        </p>
                    )}
                    <div className="mt-1 flex flex-nowrap items-center justify-end gap-1.5">
                        <span className="text-gray-600 text-[11px] shrink-0">{message.sendAt}</span>
                        {isMe && <TickIcon status={message.status ?? "sent"} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

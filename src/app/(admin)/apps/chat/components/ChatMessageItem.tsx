import { IChatItem } from "./ChatItem";

export type MessageStatus = "sent" | "delivered" | "read";

export type IChatMessageItem = {
    message: string;
    sendAt: string;
    sender: "me" | "other";
    imageUrl?: string;
    status?: MessageStatus;
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

function resolveImagePath(value?: string) {
    if (!value) {
        return undefined;
    }

    return value.startsWith("public/") ? `/${value.slice("public/".length)}` : value;
}

export const ChatMessageItem = ({ chat, message }: { chat: IChatItem; message: IChatMessageItem }) => {
    const isMe = message.sender === "me";
    const hasText = Boolean(message.message?.trim());
    const imageSrc = resolveImagePath(message.imageUrl);

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
                    className={`chat-bubble max-w-[85%] text-sm ${
                        isMe
                            ? "border border-[#b8e6b0] bg-[#d9fdd3] text-gray-900"
                            : "border border-gray-200 bg-white text-gray-900 shadow-sm"
                    }`}>
                    {imageSrc && (
                        <img
                            src={imageSrc}
                            alt="Message attachment"
                            className={`mb-2 w-full rounded-lg object-cover ${hasText ? "max-h-72" : "max-h-80"}`}
                            loading="lazy"
                        />
                    )}
                    {hasText && <p className="break-words">{message.message}</p>}
                    <div className="mt-0.5 flex flex-nowrap items-center justify-end gap-1.5">
                        <span className="shrink-0 text-[11px] text-gray-600">{message.sendAt}</span>
                        {isMe && <TickIcon status={message.status ?? "sent"} />}
                    </div>
                </div>
                {!isMe && <div className="chat-footer text-xs text-gray-600">{message.sendAt}</div>}
            </div>
        </div>
    );
};

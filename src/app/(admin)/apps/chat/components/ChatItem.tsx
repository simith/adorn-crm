import { IChatMessageItem } from "./ChatMessageItem";

export type IChatItem = {
    id: number;
    userId?: string;
    image: string;
    name: string;
    messages: IChatMessageItem[];
    unreadCount?: number;
    /** From /api/chat */
    lastSeen?: string;
    phone?: string;
    campaign?: { name: string; title: string; image_link: string };
    campaign_stats?: { responses: number; views: number; sent: number; status: string };
};

export const ChatItem = ({ image, name, messages, unreadCount, selected }: IChatItem & { selected: boolean }) => {
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const previewText = lastMessage?.message?.trim() || (lastMessage?.imageUrl ? "Image attachment" : "Tap to message");

    return (
        <div
            className={`flex cursor-pointer items-center gap-3 rounded-lg p-2 px-3 transition-colors ${
                selected ? "bg-[#f0f2f5]" : "hover:bg-[#f0f2f5]"
            }`}>
            <img src={image} className="size-11 rounded-full object-cover" alt="avatar" />
            <div className="min-w-0 grow">
                <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-gray-900">{name}</p>
                    <span className="shrink-0 text-xs text-gray-500">{lastMessage?.sendAt ?? "-"}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="line-clamp-1 truncate text-sm text-gray-600">{previewText}</p>
                    {unreadCount != null && unreadCount > 0 && (
                        <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-[#00a884] px-1.5 text-xs text-white">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

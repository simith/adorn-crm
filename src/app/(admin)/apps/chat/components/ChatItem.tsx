import { IChatMessageItem } from "./ChatMessageItem";

export type IChatItem = {
    id: number;
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

    return (
        <div
            className={`rounded-lg flex cursor-pointer items-center gap-3 p-2 px-3 transition-colors ${
                selected ? "bg-[#f0f2f5]" : "hover:bg-[#f0f2f5]"
            }`}>
            <img src={image} className="size-11 rounded-full object-cover" alt="avatar" />
            <div className="grow min-w-0">
                <div className="flex justify-between items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    <span className="text-gray-500 text-xs shrink-0">{lastMessage?.sendAt ?? "-"}</span>
                </div>
                <div className="flex justify-between items-center gap-2 mt-0.5">
                    <p className="text-gray-600 line-clamp-1 text-sm truncate">
                        {lastMessage?.message ?? "Tap to message"}
                    </p>
                    {unreadCount != null && unreadCount > 0 && (
                        <span className="rounded-full bg-[#00a884] text-white text-xs min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center shrink-0">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

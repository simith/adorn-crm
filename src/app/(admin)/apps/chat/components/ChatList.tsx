// @ts-ignore
import SimpleBar from "simplebar-react";

import { ChatItem, IChatItem } from "./ChatItem";

type IChatList = {
    chats: IChatItem[];
    selected: IChatItem;
    selectChat(chat: IChatItem): void;
};

export const ChatList = ({ chats, selected, selectChat }: IChatList) => {
    return (
        <div className="card overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-[#00a884] px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                    <label className="input input-sm flex grow items-center gap-2 bg-white/20 border-0">
                        <span className="iconify lucide--search text-white/80 size-4" />
                        <input
                            type="search"
                            className="grow bg-transparent text-white placeholder:text-white/70"
                            placeholder="Search or start new chat"
                            aria-label="Search chat"
                        />
                    </label>
                    <div className="tooltip tooltip-bottom" data-tip="New chat">
                        <button className="btn btn-ghost btn-square btn-sm text-white hover:bg-white/20" aria-label="New chat">
                            <span className="iconify lucide--plus size-4" />
                        </button>
                    </div>
                </div>
            </div>
            <SimpleBar className="h-[calc(100vh_-_306px)] bg-white">
                <div className="p-1">
                    {chats.map((chat, index) => (
                        <div onClick={() => selectChat(chat)} key={index}>
                            <ChatItem {...chat} selected={selected?.id == chat.id} />
                        </div>
                    ))}
                </div>
                <div className="border-base-300 border-t p-3">
                    <button className="btn btn-ghost btn-sm w-full justify-start gap-2 text-[#00a884]">
                        <span className="iconify lucide--user-plus size-4" />
                        New community
                    </button>
                </div>
            </SimpleBar>
        </div>
    );
};

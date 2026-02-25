"use client";

import { useEffect, useRef, useState } from "react";
import SimpleBarCore from "simplebar-core";
// @ts-ignore
import SimpleBar from "simplebar-react";

import { ChatCallModal } from "./ChatCallModal";
import { ChatInput, IChatInput } from "./ChatInput";
import { IChatItem } from "./ChatItem";
import { ChatMessageItem } from "./ChatMessageItem";

type IChatMessageList = {
    chat: IChatItem;
} & IChatInput;

export const ChatMessageList = ({ chat, onSendMessage }: IChatMessageList) => {
    const messagesScrollbarRef = useRef<SimpleBarCore | null>(null);
    const [campaignImageError, setCampaignImageError] = useState(false);

    useEffect(() => {
        const scrollE = messagesScrollbarRef.current?.getScrollElement();
        if (scrollE) scrollE.scrollTo({ top: scrollE.scrollHeight, behavior: "smooth" });
    }, [chat, messagesScrollbarRef]);

    return (
        <div className="card flex h-[calc(100vh-200px)] flex-col overflow-hidden border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 bg-[#00a884] px-4 py-3">
                <img src={chat.image} className="size-10 max-sm:size-8 rounded-full object-cover bg-base-200" alt="avatar" />
                <div className="mt-1.5 grow min-w-0">
                    <p className="leading-none font-medium text-white max-sm:text-sm truncate">{chat.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                        <div className="size-2 shrink-0 rounded-full bg-green-300" />
                        <p className="text-white/90 text-xs truncate">
                            {chat.lastSeen ?? "Active"}
                        </p>
                    </div>
                    {chat.campaign && (
                        <p className="mt-0.5 truncate text-white/70 text-xs" title={chat.campaign.title}>
                            {chat.campaign.name}
                        </p>
                    )}
                </div>
                <div className="tooltip tooltip-bottom" data-tip="Audio Call">
                    <button
                        className="btn btn-ghost btn-square btn-sm text-white hover:bg-white/20"
                        aria-label="Audio Call"
                        onClick={() => document.querySelector<HTMLDialogElement>("#apps-chat-call-modal")?.showModal()}>
                        <span className="iconify lucide--phone size-4" />
                    </button>
                </div>
                <div className="tooltip tooltip-bottom max-sm:hidden" data-tip="Video Call">
                    <button className="btn btn-ghost btn-square btn-sm text-white hover:bg-white/20" aria-label="Video Call">
                        <span className="iconify lucide--video size-4" />
                    </button>
                </div>
                <div className="tooltip tooltip-bottom max-sm:hidden" data-tip="Add to Friend">
                    <button className="btn btn-ghost btn-square btn-sm text-white hover:bg-white/20" aria-label="Add to Friend">
                        <span className="iconify lucide--user-plus size-4" />
                    </button>
                </div>
                <div className="dropdown dropdown-bottom dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-square btn-sm text-white hover:bg-white/20"
                        aria-label="More options">
                        <span className="iconify lucide--more-vertical size-4" />
                    </div>
                    <div tabIndex={0} className="dropdown-content bg-base-100 rounded-box mt-2 w-52 shadow-sm">
                        <ul className="menu w-full p-2">
                            <li>
                                <div>
                                    <span className="iconify lucide--square-user size-4" />
                                    View Profile
                                </div>
                            </li>

                            <li>
                                <div>
                                    <span className="iconify lucide--pin size-4" />
                                    Pin
                                </div>
                            </li>
                            <li>
                                <div>
                                    <span className="iconify lucide--bell-dot size-4" />
                                    Mute Notification
                                </div>
                            </li>
                        </ul>
                        <hr className="border-base-300" />
                        <ul className="menu w-full p-2">
                            <li>
                                <div>
                                    <span className="iconify lucide--archive size-4" />
                                    Archive
                                </div>
                            </li>
                            <li className="">
                                <div className="text-error hover:bg-error/10">
                                    <span className="iconify lucide--trash size-4" />
                                    Delete Chat
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {chat.campaign?.image_link && (
                <div className="flex items-center gap-3 border-b border-base-200 bg-base-100 px-4 py-3">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-base-200">
                        {campaignImageError ? (
                            <span className="iconify lucide--gem size-8 text-base-content/30" />
                        ) : (
                            <img
                                src={chat.campaign.image_link}
                                alt={chat.campaign.title}
                                className="size-full object-cover"
                                onError={() => setCampaignImageError(true)}
                            />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-base-content">{chat.campaign.title}</p>
                        <p className="text-sm text-base-content/60">{chat.campaign.name}</p>
                    </div>
                </div>
            )}
            {chat.campaign_stats && (
                <div className="flex flex-wrap items-center gap-4 border-b border-base-200 bg-base-100/80 px-4 py-2 text-xs">
                    <span className="text-base-content/70">
                        <strong className="text-base-content">Responses:</strong> {chat.campaign_stats.responses}
                    </span>
                    <span className="text-base-content/70">
                        <strong className="text-base-content">Views:</strong> {chat.campaign_stats.views.toLocaleString()}
                    </span>
                    <span className="text-base-content/70">
                        <strong className="text-base-content">Sent:</strong> {chat.campaign_stats.sent.toLocaleString()}
                    </span>
                    <span className="badge badge-soft badge-primary badge-sm">{chat.campaign_stats.status}</span>
                </div>
            )}
            <SimpleBar className="min-h-0 flex-1 bg-[#efeae2] p-5" ref={messagesScrollbarRef}>
                {chat.messages.map((message, index) => (
                    <ChatMessageItem chat={chat} message={message} key={index} />
                ))}
            </SimpleBar>
            <ChatInput onSendMessage={onSendMessage} />
            <ChatCallModal chat={chat} />
        </div>
    );
};

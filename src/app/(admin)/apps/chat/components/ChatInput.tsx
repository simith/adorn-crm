import { FormEvent } from "react";

export type IChatInput = {
    onSendMessage(message: string): void;
};

export const ChatInput = ({ onSendMessage }: IChatInput) => {
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const message = (data.get("message") as string) ?? "A new message";
        onSendMessage(message);
        e.currentTarget.reset();
    };

    return (
        <form className="flex items-center gap-2 bg-[#f0f2f5] p-3" onSubmit={onSubmit}>
            <button className="btn btn-ghost btn-sm btn-circle text-gray-600 hover:bg-gray-300/50" aria-label="Attachment" type="button">
                <span className="iconify lucide--paperclip size-5" />
            </button>
            <input
                className="input input-sm grow bg-white border border-gray-200 rounded-full focus:outline-none focus:border-[#00a884]"
                name="message"
                type="text"
                aria-label="Message"
                required
                placeholder="Type a message"
            />
            <button
                className="btn btn-circle btn-sm bg-[#00a884] border-0 text-white hover:bg-[#008f72]"
                type="submit"
                aria-label="Send message">
                <span className="iconify lucide--send size-5" />
            </button>
        </form>
    );
};

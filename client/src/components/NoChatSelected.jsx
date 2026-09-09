import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
    return (
        <div className="w-full h-full flex flex-1 flex-col items-center justify-center p-8 select-none">
            <div className="max-w-xs text-center space-y-4">
                <div className="flex justify-center">
                    <div className="size-16 rounded-2xl bg-base-200/80 border border-base-300/80 flex items-center justify-center text-base-content/60">
                        <MessageSquare className="size-7 stroke-[1.75]" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h2 className="text-base font-semibold text-base-content tracking-tight">Select a conversation</h2>
                    <p className="text-xs text-base-content/50 leading-relaxed">
                        Choose an existing chat from the sidebar or search for a contact to begin messaging.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NoChatSelected;

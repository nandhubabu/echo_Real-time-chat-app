import { MessageCircleMore, Sparkles } from "lucide-react";

const NoChatSelected = () => {
    return (
        <div className="w-full h-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-base-100/30 backdrop-blur-sm select-none">
            <div className="max-w-sm text-center space-y-5">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="size-20 rounded-3xl bg-gradient-to-tr from-[#007AFF]/15 to-[#00C6FF]/15 border border-[#007AFF]/20 flex items-center justify-center shadow-lg shadow-[#007AFF]/10">
                            <MessageCircleMore className="size-10 text-[#007AFF]" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-sm">
                            <Sparkles className="size-3" />
                        </span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <h2 className="text-xl font-bold tracking-tight text-base-content">Welcome to Echo</h2>
                    <p className="text-xs sm:text-sm text-base-content/55 max-w-xs leading-relaxed">
                        Pick a conversation from the sidebar or search for friends to start chatting in real time.
                    </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-base-content/40 bg-base-200/60 px-3 py-1 rounded-full">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        End-to-end connected
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NoChatSelected;

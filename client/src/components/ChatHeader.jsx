import { X, MoreVertical, SquareCheck, Trash2, Ban, ArrowLeft } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { getAvatarUrl, getDisplayName, handleAvatarError } from "../lib/utils";

const ChatHeader = ({ onSelect, onDeleteAll }) => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const displayName = getDisplayName(selectedUser);
    const isOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : false;

    return (
        <div className="px-4 py-3 border-b border-base-300/60 bg-base-100/80 backdrop-blur-md">
            <div className="flex min-w-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="btn btn-ghost btn-circle btn-sm -ml-1 lg:hidden hover:bg-base-200"
                        aria-label="Back to contacts"
                    >
                        <ArrowLeft className="size-5" />
                    </button>

                    <div className="relative shrink-0">
                        <img
                            src={getAvatarUrl(selectedUser)}
                            alt={displayName}
                            className="size-10 rounded-2xl object-cover ring-2 ring-base-300/60"
                            onError={handleAvatarError}
                        />
                        {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-base-100" />
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate font-semibold text-sm tracking-tight text-base-content">{displayName}</h3>
                        <p className="flex items-center gap-1.5 truncate text-[11px] font-medium">
                            {isOnline ? (
                                <span className="text-emerald-500">Active now</span>
                            ) : (
                                <span className="text-base-content/50">Offline</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:bg-base-200" aria-label="Conversation options">
                            <MoreVertical className="size-4" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[50] menu w-52 rounded-2xl border border-base-300/80 bg-base-100/95 backdrop-blur-xl p-1.5 shadow-xl">
                            <li>
                                <button
                                    type="button"
                                    onClick={() => {
                                        document.activeElement?.blur();
                                        if (onSelect) onSelect();
                                    }}
                                    className="flex items-center gap-2.5 rounded-xl py-2 text-xs font-medium"
                                >
                                    <SquareCheck className="size-4 text-base-content/70" /> Select Messages
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => {
                                        document.activeElement?.blur();
                                        if (onDeleteAll) onDeleteAll();
                                    }}
                                    className="flex items-center gap-2.5 rounded-xl py-2 text-xs font-medium text-error hover:bg-error/10"
                                >
                                    <Trash2 className="size-4" /> Delete My Messages
                                </button>
                            </li>
                            <div className="divider my-1"></div>
                            <li>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        document.activeElement?.blur();
                                        if (window.confirm("Are you sure you want to clear this entire chat?")) {
                                            const { clearChat } = useChatStore.getState();
                                            await clearChat();
                                        }
                                    }}
                                    className="flex items-center gap-2.5 rounded-xl py-2 text-xs font-semibold text-error hover:bg-error/10"
                                >
                                    <Ban className="size-4" /> Clear Chat
                                </button>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() => setSelectedUser(null)}
                        className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:bg-base-200 hidden lg:inline-flex"
                        title="Close Chat"
                        aria-label="Close Chat"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;

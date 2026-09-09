import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search, MessageSquare, X, CircleDot } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { getAvatarUrl, getDisplayName, handleAvatarError } from "../lib/utils";

const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const filteredUsers = users.filter((user) => {
        const matchesSearch = getDisplayName(user).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesOnline = showOnlineOnly ? onlineUsers.includes(user._id) : true;
        return matchesSearch && matchesOnline;
    });

    if (isUsersLoading) return <SidebarSkeleton />;

    const onlineCount = Math.max(0, onlineUsers.length - 1);

    return (
        <aside className="flex h-full min-h-0 w-full flex-col border-r border-base-300/60 bg-base-100/60 backdrop-blur-md transition-all duration-200">
            {/* Header & Floating Search */}
            <div className="w-full shrink-0 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
                            <MessageSquare className="size-4" />
                        </div>
                        <h2 className="font-bold text-sm tracking-tight">Conversations</h2>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-base-200 text-base-content/60">
                        {users.length}
                    </span>
                </div>

                {/* Apple / Telegram Floating Search Bar */}
                <div className="relative flex items-center">
                    <Search className="pointer-events-none absolute left-3.5 size-4 text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full rounded-full border border-base-300/70 bg-base-200/50 py-2 pl-9 pr-8 text-xs placeholder:text-base-content/40 transition-all focus:border-[#007AFF] focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/25"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 text-base-content/40 hover:text-base-content transition-colors"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                {/* Online Filter Toggle Pill */}
                <div className="flex items-center justify-between pt-1">
                    <button
                        type="button"
                        onClick={() => setShowOnlineOnly((prev) => !prev)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                            showOnlineOnly
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-base-200/60 text-base-content/60 hover:bg-base-200"
                        }`}
                    >
                        <CircleDot className="size-3" />
                        <span>Online only</span>
                    </button>
                    <span className="text-[11px] text-base-content/50 font-medium">
                        {onlineCount} {onlineCount === 1 ? "active" : "active"}
                    </span>
                </div>
            </div>

            {/* User List as Rounded Pill Cards */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1 custom-scrollbar">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 px-4 flex flex-col items-center gap-2">
                        <div className="size-12 rounded-2xl bg-base-200/60 flex items-center justify-center text-base-content/40 mb-1">
                            <Search className="size-6" />
                        </div>
                        <p className="text-xs font-semibold text-base-content/70">No conversations found</p>
                        <p className="text-[11px] text-base-content/40 max-w-[200px]">
                            {searchQuery ? "Try a different search keyword" : "Start messaging your friends or add contacts"}
                        </p>
                    </div>
                ) : (
                    filteredUsers.map((user) => {
                        const displayName = getDisplayName(user);
                        const isSelected = selectedUser?._id === user._id;
                        const isOnline = onlineUsers.includes(user._id);

                        return (
                            <button
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                className={`group flex w-full min-w-0 items-center gap-3 rounded-2xl p-2.5 my-1 text-left transition-all duration-200 ${
                                    isSelected
                                        ? "bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25"
                                        : "hover:bg-base-200/80 active:scale-[0.99]"
                                }`}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={getAvatarUrl(user)}
                                        alt={displayName}
                                        className={`size-11 rounded-2xl object-cover ring-2 transition-all ${
                                            isSelected ? "ring-white/40" : "ring-base-300/60 group-hover:ring-base-300"
                                        }`}
                                        onError={handleAvatarError}
                                    />
                                    {isOnline && (
                                        <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ${
                                            isSelected ? "ring-[#007AFF]" : "ring-base-100"
                                        }`} />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                        <div className={`font-semibold text-xs truncate tracking-tight ${
                                            isSelected ? "text-white" : "text-base-content"
                                        }`}>
                                            {displayName}
                                        </div>
                                    </div>
                                    <div className={`text-[11px] truncate mt-0.5 ${
                                        isSelected ? "text-white/80" : isOnline ? "text-emerald-500 font-medium" : "text-base-content/50"
                                    }`}>
                                        {isOnline ? "Online" : "Offline"}
                                    </div>
                                </div>

                                {user.unreadCount > 0 && (
                                    <div className={`shrink-0 flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold ${
                                        isSelected ? "bg-white text-[#007AFF]" : "bg-[#007AFF] text-white shadow-sm"
                                    }`}>
                                        {user.unreadCount}
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </aside>
    );
};

export default Sidebar;

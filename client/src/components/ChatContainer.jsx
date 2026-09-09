import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSettingsStore } from "../store/useSettingsStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { formatMessageTime, getAvatarUrl, getDisplayName, handleAvatarError } from "../lib/utils";
import { Check, CheckCheck, Trash2, Pencil, X } from "lucide-react";

const ChatContainer = () => {
    const {
        messages, getMessages, isMessagesLoading,
        selectedUser,
        markAsRead, deleteMessage, deleteSelectedMessages, deleteAllMessages, editMessage,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const { showTimestamps, fontSize, showReadReceipts } = useSettingsStore();
    const messageEndRef = useRef(null);
    const selectedDisplayName = getDisplayName(selectedUser);
    const authDisplayName = getDisplayName(authUser);

    // Context menu state
    const [contextMenu, setContextMenu] = useState(null);

    // Multi-select state
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        if (!selectedUser) return;

        getMessages(selectedUser._id);
        markAsRead(selectedUser._id);
    }, [selectedUser, getMessages, markAsRead]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        const close = () => setContextMenu(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    const handleRightClick = (e, message) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            message,
        });
    };

    const handleDeleteOne = async () => {
        await deleteMessage(contextMenu.message._id);
        setContextMenu(null);
    };

    const handleEditStart = () => {
        setEditingId(contextMenu.message._id);
        setEditText(contextMenu.message.text || "");
        setContextMenu(null);
    };

    const handleEditSave = async (messageId) => {
        if (!editText.trim()) return;
        await editMessage(messageId, editText);
        setEditingId(null);
    };

    const toggleSelectMessage = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        await deleteSelectedMessages(Array.from(selectedIds));
        setSelectedIds(new Set());
        setSelectMode(false);
    };

    const handleDeleteAll = async () => {
        if (!confirm("Delete all your messages in this chat?")) return;
        await deleteAllMessages();
    };

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-base-100/50">
                <span className="loading loading-spinner loading-md text-[#007AFF]"></span>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-base-100/40 backdrop-blur-md" onClick={() => setContextMenu(null)}>
            <div className="flex-none z-10">
                <ChatHeader onSelect={() => setSelectMode(true)} onDeleteAll={handleDeleteAll} />
            </div>

            {/* Multi-select Toolbar */}
            {selectMode && (
                <div className="z-10 flex flex-none flex-wrap items-center gap-2 border-b border-base-300/60 bg-base-200/90 px-4 py-2 text-xs sm:px-6">
                    <span className="font-semibold">{selectedIds.size} selected</span>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            className="btn btn-xs btn-error rounded-full gap-1"
                            disabled={selectedIds.size === 0}
                            onClick={handleDeleteSelected}
                        >
                            <Trash2 className="size-3" /> Delete
                        </button>
                        <button
                            className="btn btn-xs btn-ghost rounded-full"
                            onClick={() => {
                                setSelectMode(false);
                                setSelectedIds(new Set());
                            }}
                        >
                            <X className="size-3" /> Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Message Thread */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-base-content/40 space-y-2">
                        <div className="size-14 rounded-3xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                            <CheckCheck className="size-7" />
                        </div>
                        <p className="text-xs font-semibold text-base-content/60">Say hello to {selectedDisplayName}!</p>
                        <p className="text-[11px] max-w-xs">Send a message or photo to kickstart your conversation.</p>
                    </div>
                )}

                {messages.map((message) => {
                    const isFromMe = message.senderId === authUser?._id;
                    const profilePic = isFromMe ? getAvatarUrl(authUser) : getAvatarUrl(selectedUser);
                    const avatarAlt = isFromMe ? authDisplayName : selectedDisplayName;
                    const isSelected = selectedIds.has(message._id);
                    const isEditing = editingId === message._id;

                    return (
                        <div
                            key={message._id}
                            className={`chat relative w-full ${isFromMe ? "chat-end" : "chat-start"} ${selectMode && isFromMe ? "pl-6 sm:pl-7" : ""}`}
                            onContextMenu={(e) => isFromMe && !message.isDeleted && handleRightClick(e, message)}
                            onClick={() => selectMode && isFromMe && toggleSelectMessage(message._id)}
                        >
                            {/* Checkbox in select mode */}
                            {selectMode && isFromMe && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-xs checkbox-primary"
                                        checked={isSelected}
                                        onChange={() => toggleSelectMessage(message._id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            )}

                            <div className="chat-image avatar">
                                <div className="size-8 sm:size-9 rounded-2xl ring-1 ring-base-300/60 overflow-hidden">
                                    <img src={profilePic} alt={avatarAlt} onError={handleAvatarError} />
                                </div>
                            </div>

                            {showTimestamps && (
                                <div className="chat-header mb-1">
                                    <time className="text-[10px] opacity-40 font-medium ml-1">
                                        {formatMessageTime(message.createdAt)}
                                    </time>
                                </div>
                            )}

                            {/* Deleted message placeholder */}
                            {message.isDeleted ? (
                                <div className="chat-bubble flex max-w-[min(82vw,20rem)] items-center gap-1.5 bg-base-200/60 text-xs italic text-base-content/40 rounded-2xl border border-base-300/40 sm:max-w-[70%]">
                                    <Trash2 className="size-3" /> This message was deleted
                                </div>
                            ) : isEditing ? (
                                <div className="flex w-full max-w-[min(18rem,70vw)] items-center gap-2 sm:max-w-xs">
                                    <input
                                        className="input input-sm input-bordered min-w-0 flex-1 rounded-full text-xs"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleEditSave(message._id);
                                            if (e.key === "Escape") setEditingId(null);
                                        }}
                                        autoFocus
                                    />
                                    <button className="btn btn-xs btn-circle btn-success text-white" onClick={() => handleEditSave(message._id)}>✓</button>
                                    <button className="btn btn-xs btn-circle btn-ghost" onClick={() => setEditingId(null)}>✕</button>
                                </div>
                            ) : (
                                <div
                                    className={`chat-bubble flex max-w-[min(82vw,22rem)] flex-col break-words sm:max-w-[75%] px-4 py-2.5 transition-all
                                    ${isFromMe 
                                        ? "bubble-apple-sent rounded-2xl rounded-tr-xs" 
                                        : "bubble-apple-received rounded-2xl rounded-tl-xs"
                                    }
                                    ${isSelected ? "ring-2 ring-[#007AFF] ring-offset-2" : ""}
                                    ${fontSize === "small" ? "text-xs" : fontSize === "large" ? "text-base" : "text-sm"}
                                    `}
                                >
                                    {message.image && (
                                        <div className="mb-2 overflow-hidden rounded-xl border border-black/5 dark:border-white/10 shadow-sm">
                                            <img
                                                src={message.image}
                                                alt="Attachment"
                                                className="w-full max-w-[min(18rem,70vw)] object-cover sm:max-w-[240px] hover:scale-102 transition-transform duration-200"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    {message.text && (
                                        <p className="leading-relaxed">
                                            {message.text}
                                            {message.isEdited && (
                                                <span className="text-[10px] opacity-60 ml-1.5 italic">(edited)</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Read receipt */}
                            {showReadReceipts && isFromMe && !message.isDeleted && (
                                <div className="chat-footer mt-0.5">
                                    {message.isRead ? (
                                        <CheckCheck className="size-3.5 text-[#007AFF]" title="Read" />
                                    ) : (
                                        <Check className="size-3.5 opacity-40" title="Sent" />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messageEndRef} />
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 rounded-2xl border border-base-300/80 bg-base-100/95 backdrop-blur-xl shadow-xl py-1.5 min-w-36 overflow-hidden"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.message.text && (
                        <button
                            className="w-full px-3.5 py-2 text-xs text-left flex items-center gap-2 hover:bg-base-200 font-medium"
                            onClick={handleEditStart}
                        >
                            <Pencil className="size-3.5 text-base-content/70" /> Edit
                        </button>
                    )}
                    <button
                        className="w-full px-3.5 py-2 text-xs text-left flex items-center gap-2 hover:bg-error/10 text-error font-medium"
                        onClick={handleDeleteOne}
                    >
                        <Trash2 className="size-3.5" /> Delete
                    </button>
                </div>
            )}

            {/* Floating Message Input Bar */}
            <div className="z-10 flex-none border-t border-base-300/60 bg-base-100/80 backdrop-blur-md p-3 sm:px-6 sm:py-3.5">
                <MessageInput />
            </div>
        </div>
    );
};

export default ChatContainer;

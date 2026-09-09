import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Bell, MessageCircle, Shield, Palette, Volume2, Monitor, Clock, Type, Eye, CheckCheck, ArrowLeft, UserPlus, Search } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getAvatarUrl, getDisplayName, handleAvatarError } from "../lib/utils";

const THEMES = [
    "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
    "synthwave", "retro", "cyberpunk", "valentine", "halloween",
    "garden", "forest", "aqua", "lofi", "pastel", "fantasy",
    "wireframe", "black", "luxury", "dracula", "cmyk", "autumn",
    "business", "acid", "lemonade", "night", "coffee", "winter",
    "dim", "nord", "sunset",
];

const PREVIEW_MESSAGES = [
    { id: 1, content: "Hey! How's it going?", isSent: false },
    { id: 2, content: "Everything is going well. Just reviewing the latest updates.", isSent: true },
];

const FlipCard = ({ title, description, icon, colorClass, isFlipped, onToggle, children }) => {
    const Icon = icon;

    return (
        <div className={`bg-base-300 rounded-xl overflow-hidden shadow-sm h-full flex flex-col transition-all duration-300 ${isFlipped ? 'col-span-1 md:col-span-2' : ''}`}>
            {!isFlipped ? (
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-base-200/50 transition-colors" onClick={onToggle}>
                    <div className={`p-4 rounded-xl mb-4 ${colorClass.bg}`}>
                        <Icon className={`w-8 h-8 ${colorClass.text}`} />
                    </div>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="text-sm text-base-content/60 mt-2 mb-6">{description}</p>
                    <button className="btn btn-outline btn-sm rounded-full px-6">
                        More
                    </button>
                </div>
            ) : (
                <div className="flex-1 p-6 flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-base-200">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${colorClass.bg}`}>
                                <Icon className={`w-5 h-5 ${colorClass.text}`} />
                            </div>
                            <h2 className="text-lg font-semibold">{title}</h2>
                        </div>
                        <button onClick={onToggle} className="btn btn-ghost btn-sm gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    </div>
                    <div className="flex-1 space-y-2">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsPage = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useThemeStore();
    const {
        messageNotifications, setMessageNotifications,
        soundEnabled, setSoundEnabled,
        desktopNotifications, setDesktopNotifications,
        enterToSend, setEnterToSend,
        showTimestamps, setShowTimestamps,
        fontSize, setFontSize,
        showOnlineStatus, setShowOnlineStatus,
        showReadReceipts, setShowReadReceipts,
    } = useSettingsStore();

    const [flipped, setFlipped] = useState({
        notifications: false,
        chat: false,
        privacy: false,
        theme: false,
        contacts: false
    });

    const isMobile = window.innerWidth < 768; // Simple mobile detection

    const { setSelectedUser } = useChatStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await axiosInstance.get(`/messages/search/${searchQuery.trim()}`);
            setSearchResult(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "User not found");
            setSearchResult(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSearchResult = (user) => {
        setSelectedUser(user);
        navigate("/");
    };

    const toggleFlip = (card) => {
        setFlipped(prev => ({ ...prev, [card]: !prev[card] }));
    };

    return (
        <div className="min-h-screen pt-20 pb-10 container mx-auto px-4 max-w-5xl">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <div className="w-20"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* NOTIFICATION SETTINGS */}
                    {!(flipped.chat || flipped.privacy || flipped.theme || flipped.contacts) && (
                        <FlipCard
                            title="Notification Settings"
                            description="Manage how you receive alerts"
                            icon={Bell}
                            colorClass={{ bg: "bg-primary/10", text: "text-primary" }}
                            isFlipped={flipped.notifications}
                            onToggle={() => toggleFlip("notifications")}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between py-3 px-2 hover:bg-base-200/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="w-4 h-4 text-base-content/60" />
                                        <div>
                                            <p className="font-medium text-sm">Message Notifications</p>
                                            <p className="text-xs text-base-content/50">Get notified when you receive a message</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={messageNotifications} onChange={(e) => setMessageNotifications(e.target.checked)} />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 hover:bg-base-200/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Volume2 className="w-4 h-4 text-base-content/60" />
                                        <div>
                                            <p className="font-medium text-sm">Notification Sound</p>
                                            <p className="text-xs text-base-content/50">Play a sound for incoming messages</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
                                </div>
                                {!isMobile && (
                                    <div className="flex items-center justify-between py-3 px-2 hover:bg-base-200/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Monitor className="w-4 h-4 text-base-content/60" />
                                            <div>
                                                <p className="font-medium text-sm">Desktop Notifications</p>
                                                <p className="text-xs text-base-content/50">Show browser push notifications</p>
                                            </div>
                                        </div>
                                        <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={desktopNotifications} onChange={(e) => {
                                            setDesktopNotifications(e.target.checked);
                                            if (e.target.checked && "Notification" in window && Notification.permission !== "granted") {
                                                Notification.requestPermission();
                                            }
                                        }} />
                                    </div>
                                )}
                            </div>
                        </FlipCard>
                    )}

                    {/* CHAT SETTINGS */}
                    {!(flipped.notifications || flipped.privacy || flipped.theme || flipped.contacts) && (
                        <FlipCard
                            title="Chat Settings"
                            description="Customize your chat experience"
                            icon={MessageCircle}
                            colorClass={{ bg: "bg-secondary/10", text: "text-secondary" }}
                            isFlipped={flipped.chat}
                            onToggle={() => toggleFlip("chat")}
                        >
                            <div className="space-y-2">
                                {!isMobile && (
                                    <div className="flex items-center justify-between py-3 px-2 hover:bg-base-200/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Send className="w-4 h-4 text-base-content/60" />
                                            <div>
                                                <p className="font-medium text-sm">Enter to Send</p>
                                                <p className="text-xs text-base-content/50">Press Enter to send messages</p>
                                            </div>
                                        </div>
                                        <input type="checkbox" className="toggle toggle-secondary toggle-sm" checked={enterToSend} onChange={(e) => setEnterToSend(e.target.checked)} />
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-3 px-2 hover:bg-base-200/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-base-content/60" />
                                        <div>
                                            <p className="font-medium text-sm">Show Timestamps</p>
                                            <p className="text-xs text-base-content/50">Display time on each message</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="toggle toggle-secondary toggle-sm" checked={showTimestamps} onChange={(e) => setShowTimestamps(e.target.checked)} />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 hover:bg-base-200/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Type className="w-4 h-4 text-base-content/60" />
                                        <div>
                                            <p className="font-medium text-sm">Font Size</p>
                                            <p className="text-xs text-base-content/50">Adjust the chat text size</p>
                                        </div>
                                    </div>
                                    <select className="select select-bordered select-sm w-32" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                            </div>
                        </FlipCard>
                    )}

                    {/* PRIVACY SETTINGS */}
                    {!(flipped.notifications || flipped.chat || flipped.theme || flipped.contacts) && (
                        <FlipCard
                            title="Privacy Settings"
                            description="Control your privacy preferences"
                            icon={Shield}
                            colorClass={{ bg: "bg-accent/10", text: "text-accent" }}
                            isFlipped={flipped.privacy}
                            onToggle={() => toggleFlip("privacy")}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between py-3 px-2 hover:bg-base-200/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Eye className="w-4 h-4 text-base-content/60" />
                                        <div>
                                            <p className="font-medium text-sm">Show Online Status</p>
                                            <p className="text-xs text-base-content/50">Let others see when you are online</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="toggle toggle-accent toggle-sm" checked={showOnlineStatus} onChange={(e) => setShowOnlineStatus(e.target.checked)} />
                                </div>
                                <div className="flex items-center justify-between py-3 px-2 hover:bg-base-200/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCheck className="w-4 h-4 text-base-content/60" />
                                        <div>
                                            <p className="font-medium text-sm">Read Receipts</p>
                                            <p className="text-xs text-base-content/50">Show others when you've read messages</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="toggle toggle-accent toggle-sm" checked={showReadReceipts} onChange={(e) => setShowReadReceipts(e.target.checked)} />
                                </div>
                            </div>
                        </FlipCard>
                    )}

                    {/* THEME SETTINGS */}
                    {!(flipped.notifications || flipped.chat || flipped.privacy || flipped.contacts) && (
                        <FlipCard
                            title="Appearance & Theme"
                            description="Personalize your chat interface"
                            icon={Palette}
                            colorClass={{ bg: "bg-warning/10", text: "text-warning" }}
                            isFlipped={flipped.theme}
                            onToggle={() => toggleFlip("theme")}
                        >
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
                                {THEMES.map((t) => (
                                    <button
                                        key={t}
                                        className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${theme === t ? "bg-base-200 ring-2 ring-primary" : "hover:bg-base-200/50"}`}
                                        onClick={() => setTheme(t)}
                                    >
                                        <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                                            <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                                                <div className="rounded bg-primary"></div>
                                                <div className="rounded bg-secondary"></div>
                                                <div className="rounded bg-accent"></div>
                                                <div className="rounded bg-neutral"></div>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-medium truncate w-full text-center">
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <h3 className="text-sm font-semibold mb-3 text-base-content/70">Theme Preview</h3>
                            <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-sm max-w-lg mx-auto">
                                <div className="p-4 bg-base-200">
                                    <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                                        <div className="px-4 py-3 border-b border-base-300 bg-base-100 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">J</div>
                                            <div>
                                                <h3 className="font-medium text-sm">John Doe</h3>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4 bg-base-100">
                                            {PREVIEW_MESSAGES.map((message) => (
                                                <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[80%] rounded-xl p-3 shadow-sm ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200"}`}>
                                                        <p className="text-sm">{message.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FlipCard>
                    )}

                    {/* ADD CONTACT SETTINGS */}
                    {!(flipped.notifications || flipped.chat || flipped.privacy || flipped.theme) && (
                        <FlipCard
                            title="Add Contact"
                            description="Find and message new users by ID"
                            icon={UserPlus}
                            colorClass={{ bg: "bg-info/10", text: "text-info" }}
                            isFlipped={flipped.contacts}
                            onToggle={() => toggleFlip("contacts")}
                        >
                            <div className="space-y-4">
                                <p className="text-sm text-base-content/70">
                                    Search for your friends by their unique user ID to start a conversation.
                                </p>
                                <form onSubmit={handleSearch} className="flex items-center gap-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Search by ID (USR-XXXXXX)"
                                        className="input input-bordered w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-square btn-primary"
                                        disabled={isSearching}
                                    >
                                        {isSearching
                                            ? <span className="loading loading-spinner" />
                                            : <Search className="size-5" />
                                        }
                                    </button>
                                </form>

                                {searchResult && (
                                    <div className="p-4 border border-base-300 bg-base-200/50 rounded-xl mt-4">
                                        <p className="text-xs text-base-content/50 mb-3 font-semibold uppercase tracking-wider">Search Result</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={getAvatarUrl(searchResult)}
                                                    alt={getDisplayName(searchResult)}
                                                    className="size-12 object-cover rounded-full"
                                                    onError={handleAvatarError}
                                                />
                                                <div>
                                                    <div className="font-bold text-lg">{getDisplayName(searchResult)}</div>
                                                    <div className="text-sm text-primary">{searchResult.uniqueId}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSelectSearchResult(searchResult)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Message
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FlipCard>
                    )}
                </div>
            </div>
        </div>
    );
};
export default SettingsPage;

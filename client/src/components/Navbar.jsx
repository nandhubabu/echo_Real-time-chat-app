import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { MessageCircleMore, Settings, User, Sun, Moon } from "lucide-react";

const Navbar = () => {
    const { authUser } = useAuthStore();
    const { theme, setTheme } = useThemeStore();

    const isDarkMode = theme === "dark" || theme === "dim" || theme === "night" || theme === "luxury" || theme === "dracula" || theme === "black";

    const toggleTheme = () => {
        setTheme(isDarkMode ? "light" : "dark");
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-base-300/60 bg-base-100/80 backdrop-blur-xl transition-all">
            <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6">
                {/* Logo & Brand */}
                <Link to="/" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight group">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#007AFF] to-[#00C6FF] text-white shadow-md shadow-[#007AFF]/25 transition-transform group-hover:scale-105">
                        <MessageCircleMore className="size-5" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-bold text-base tracking-tight">Echo</span>
                        <span className="text-[10px] text-base-content/50 font-medium">Messenger</span>
                    </div>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Quick Light / Dark Mode Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="btn btn-ghost btn-circle btn-sm hover:bg-base-200/80 transition-transform active:scale-95"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? (
                            <Sun className="size-4 text-amber-400 transition-all" />
                        ) : (
                            <Moon className="size-4 text-indigo-500 transition-all" />
                        )}
                    </button>

                    <Link
                        to="/settings"
                        className="btn btn-ghost btn-sm rounded-full gap-2 px-3 hover:bg-base-200/80"
                    >
                        <Settings className="size-4 text-base-content/70" />
                        <span className="hidden text-xs font-medium sm:inline">Settings</span>
                    </Link>

                    {authUser && (
                        <Link
                            to="/profile"
                            className="btn btn-ghost btn-sm rounded-full gap-2 px-3 hover:bg-base-200/80"
                        >
                            <User className="size-4 text-base-content/70" />
                            <span className="hidden text-xs font-medium sm:inline">Profile</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;

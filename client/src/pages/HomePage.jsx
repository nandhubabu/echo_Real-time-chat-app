import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
    const { selectedUser } = useChatStore();

    return (
        <div className="flex h-screen min-h-[100dvh] flex-col overflow-hidden bg-base-200/60 antialiased">
            <div className="h-16 shrink-0" /> {/* Spacer for fixed Navbar */}

            <main className="flex min-h-0 flex-1 items-stretch justify-center p-0 lg:p-4 xl:px-8">
                <div className="flex h-full min-h-0 w-full max-w-7xl overflow-hidden bg-base-100 lg:rounded-3xl lg:border lg:border-base-300/60 lg:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                    <div className="flex h-full min-h-0 w-full overflow-hidden">
                        {/* Sidebar: hidden on mobile if a user is selected */}
                        <div className={`h-full min-w-0 ${selectedUser ? "hidden lg:flex" : "flex"} w-full lg:w-84 xl:w-90 lg:flex-none`}>
                            <Sidebar />
                        </div>

                        {/* ChatContainer / Empty State: hidden on mobile if no user is selected */}
                        <div className={`h-full min-w-0 w-full flex-1 ${!selectedUser ? "hidden lg:flex" : "flex"}`}>
                            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;

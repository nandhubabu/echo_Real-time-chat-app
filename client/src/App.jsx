import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";
import Loading from "./components/Loading";
import { Toaster } from "react-hot-toast";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";
import { toast } from "react-hot-toast";

function App() {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Handle global chat events (new messages matching state, etc)
  useEffect(() => {
    if (authUser && socket) {
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [authUser, socket, subscribeToMessages, unsubscribeFromMessages]);

  // Global message notification listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const isMessageForActiveChat = selectedUser && newMessage.senderId === selectedUser._id;

      if (!isMessageForActiveChat || document.hidden) {
        const settingsStr = localStorage.getItem("chat-settings");
        const settings = settingsStr ? JSON.parse(settingsStr).state : {};

        if (settings.soundEnabled ?? true) {
          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => { });
        }
        if (settings.messageNotifications ?? true) {
          toast.success("New message received");
        }
        if (settings.desktopNotifications && "Notification" in window && Notification.permission === "granted") {
          new Notification("New Message", { body: "You have received a new message" });
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  if (isCheckingAuth && !authUser) {
    return <Loading />;
  }

  return (
    <div>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
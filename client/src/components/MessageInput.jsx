import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { Image, Paperclip, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { sendMessage } = useChatStore();
    const { enterToSend } = useSettingsStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;

        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview
            });

            // Clear form
            setText("");
            removeImage();
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="w-full min-w-0">
            {/* Image Preview floating card */}
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative group">
                        <img
                            src={imagePreview}
                            alt="Attachment preview"
                            className="size-20 rounded-2xl object-cover ring-2 ring-[#007AFF]/30 shadow-md"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-base-300/90 backdrop-blur-md text-base-content flex items-center justify-center hover:bg-error hover:text-white transition-colors shadow-sm"
                            type="button"
                            aria-label="Remove image"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Apple/Telegram Pill Input Bar */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center rounded-full border border-base-300/80 bg-base-200/50 px-3 py-1.5 transition-all focus-within:border-[#007AFF] focus-within:bg-base-100 focus-within:ring-2 focus-within:ring-[#007AFF]/25">
                    {/* Attachment button */}
                    <button
                        type="button"
                        className={`size-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                            imagePreview 
                                ? "text-[#007AFF] bg-[#007AFF]/10" 
                                : "text-base-content/50 hover:text-base-content hover:bg-base-200"
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach Photo"
                        aria-label="Attach Photo"
                    >
                        <Paperclip className="size-4" />
                    </button>

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    {/* Text input */}
                    <input
                        type="text"
                        className="flex-1 bg-transparent px-3 py-1 text-xs sm:text-sm text-base-content placeholder:text-base-content/40 focus:outline-none min-w-0"
                        placeholder="Write a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !enterToSend) {
                                e.preventDefault();
                            }
                        }}
                    />
                </div>

                {/* Royal Blue Circular Send Button */}
                <button
                    type="submit"
                    className="size-10 sm:size-11 shrink-0 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-md shadow-[#007AFF]/25 transition-all hover:bg-[#0062D2] active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                    disabled={!text.trim() && !imagePreview}
                    aria-label="Send message"
                >
                    <Send className="size-4 sm:size-4.5 -ml-0.5" />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;

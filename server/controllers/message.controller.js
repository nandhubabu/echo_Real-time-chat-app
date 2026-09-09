import Message from "../models/Message.js";
import User from "../models/User.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";
import xss from "xss";

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params; // The person you are chatting with
        const senderId = req.user._id; // The logged-in user (from your JWT middleware)

        let imageUrl;
        if (image) {
            // Validate it's actually an image string
            if (!/^data:image\/(jpeg|png|gif|webp);base64,/.test(image)) {
                return res.status(400).json({ error: "Invalid image format" });
            }
            if (image.length > 7000000) { // ~5MB base64 size limit
                return res.status(400).json({ error: "Image file is too large (max 5MB)" });
            }
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const sanitizedText = text ? xss(text.trim()) : null;

        // 1. Create the message object
        const newMessage = new Message({
            senderId,
            receiverId,
            text: sanitizedText,
            image: imageUrl,
        });

        // 2. Save it permanently
        await newMessage.save();

        // 3. Real-time Logic: Send to the receiver if they are online
        const receiverSocketIds = getReceiverSocketId(receiverId);
        if (receiverSocketIds.length > 0) {
            io.to(receiverSocketIds).emit("newMessage", newMessage);
        }

        // Also emit to the sender's OTHER open tabs/devices (so their chat stays in sync)
        const senderSocketIds = getReceiverSocketId(senderId);
        if (senderSocketIds.length > 0) {
            // We don't want to emit to the specific socket that sent the request, but we don't have it here.
            // However, our frontend ignores duplicate messages by adding them to state locally.
            io.to(senderSocketIds).emit("newMessageSync", newMessage); 
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find all unique user IDs that the logged-in user has messaged or received messages from
        const sentToIds = await Message.distinct("receiverId", { 
            senderId: loggedInUserId, 
            clearedBy: { $ne: loggedInUserId } 
        });
        const receivedFromIds = await Message.distinct("senderId", { 
            receiverId: loggedInUserId, 
            clearedBy: { $ne: loggedInUserId } 
        });

        // Collect the other user IDs from each message conversation
        const contactIds = new Set([...sentToIds.map(String), ...receivedFromIds.map(String)]);

        // Fetch full user details for those contacts only
        const contacts = await User.find({
            _id: { $in: Array.from(contactIds) },
        }).select("-password").lean();

        // Calculate unread message count for each contact
        for (let contact of contacts) {
            const unreadCount = await Message.countDocuments({
                senderId: contact._id,
                receiverId: loggedInUserId,
                isRead: false,
                isDeleted: { $ne: true },
                clearedBy: { $ne: loggedInUserId }
            });
            contact.unreadCount = unreadCount;
        }

        res.status(200).json(contacts);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const searchUserByUniqueId = async (req, res) => {
    try {
        const { uniqueId } = req.params;
        const loggedInUserId = req.user._id;

        // Clean query: trim whitespace and strip leading '@' if provided
        const cleanQuery = (uniqueId || "").trim().replace(/^@/, "");

        if (!cleanQuery) {
            return res.status(400).json({ message: "Please provide a username or email to search" });
        }

        // Search by username (case-insensitive exact match) or email
        const user = await User.findOne({
            _id: { $ne: loggedInUserId },
            $or: [
                { username: { $regex: new RegExp(`^${cleanQuery}$`, "i") } },
                { email: cleanQuery.toLowerCase() },
                { uniqueId: cleanQuery.toUpperCase() },
            ],
        }).select("-password");

        if (!user) {
            return res.status(404).json({ message: `No user found with username @${cleanQuery}` });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error in user search: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const searchUser = searchUserByUniqueId;


export const markMessagesRead = async (req, res) => {
    try {
        const { senderId } = req.params;  // the person who sent the messages we are marking as read
        const receiverId = req.user._id;  // the logged-in user who is now reading them

        // Mark all unread messages from senderId to receiverId as read
        await Message.updateMany(
            { senderId, receiverId, isRead: false },
            { $set: { isRead: true } }
        );

        // Notify the original sender in real-time that their messages were read
        const senderSocketIds = getReceiverSocketId(senderId);
        if (senderSocketIds.length > 0) {
            io.to(senderSocketIds).emit("messagesRead", { readBy: receiverId, from: senderId });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in markMessagesRead: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
            clearedBy: { $ne: myId },
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ error: "Message not found" });
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only delete your own messages" });
        }

        // Soft-delete: mark as deleted, clear text/image
        message.isDeleted = true;
        message.text = null;
        message.image = null;
        await message.save();

        // Notify the other person in real-time
        const otherUserId = message.receiverId.toString();
        const receiverSocketIds = getReceiverSocketId(otherUserId);
        if (receiverSocketIds.length > 0) {
            io.to(receiverSocketIds).emit("messageDeleted", { messageId: id });
        }

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in deleteMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text?.trim()) return res.status(400).json({ error: "Text cannot be empty" });

        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ error: "Message not found" });
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only edit your own messages" });
        }
        if (message.isDeleted) return res.status(400).json({ error: "Cannot edit a deleted message" });

        message.text = xss(text.trim());
        message.isEdited = true;
        await message.save();

        // Notify the other person in real-time
        const receiverSocketIds = getReceiverSocketId(message.receiverId.toString());
        if (receiverSocketIds.length > 0) {
            io.to(receiverSocketIds).emit("messageEdited", message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in editMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteAllMessages = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const myId = req.user._id;

        // Soft-delete all messages I sent in this conversation
        await Message.updateMany(
            { senderId: myId, receiverId: otherUserId },
            { $set: { isDeleted: true, text: null, image: null } }
        );

        // Notify the other person
        const receiverSocketIds = getReceiverSocketId(otherUserId);
        if (receiverSocketIds.length > 0) {
            io.to(receiverSocketIds).emit("allMessagesDeleted", { fromUserId: myId });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.log("Error in deleteAllMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const clearChat = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const myId = req.user._id;

        // Soft-delete ALL messages in this conversation for the viewing user only
        await Message.updateMany(
            {
                $or: [
                    { senderId: myId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: myId },
                ],
            },
            { $addToSet: { clearedBy: myId } }
        );

        // Because it's only clearing for me, we DO NOT send chatCleared to the other user.
        // It should stay on their screen.
        // But we DO need to clear it from our own screen via the normal React state clear in the frontend.

        res.status(200).json({ success: true });
    } catch (error) {
        console.log("Error in clearChat controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
import User from '../models/User.js'; // Must include .js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../lib/cloudinary.js';
import xss from 'xss';

export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Validation Logic
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const sanitizedUsername = xss(username);
        const sanitizedEmail = email.toLowerCase().trim();

        // 2. Check if user already exists
        const existingEmail = await User.findOne({ email: sanitizedEmail });
        if (existingEmail) return res.status(400).json({ message: "Email already exists" });

        const existingUsername = await User.findOne({ username: sanitizedUsername });
        if (existingUsername) return res.status(400).json({ message: "Username already exists" });

        // 3. Hash the Password (The Industry Guard)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create and Save the User
        const newUser = new User({
            username: sanitizedUsername,
            email: sanitizedEmail,
            password: hashedPassword,
        });

        if (newUser) {
            await newUser.save();

            // 5. Generate JWT (The Digital Passport)
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
                expiresIn: "7d", // User stays logged in for 7 days
            });

            res.cookie("jwt", token, {
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
                httpOnly: true, // Prevents XSS attacks
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production",
            });

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePic: newUser.profilePic,
                uniqueId: newUser.uniqueId,
            });
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 2. Compare Password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 3. Generate Token (The same logic as signup)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });

        // 4. Lazy fix for legacy users (ensure they have a profile pic)
        const defaultAvatar = "https://avatar.iran.liara.run/public";
        if (!user.profilePic) {
            user.profilePic = defaultAvatar;
            await user.save();
        }

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic,
            uniqueId: user.uniqueId,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        // Lazy fix for legacy users
        const defaultAvatar = "https://avatar.iran.liara.run/public";
        if (!user.profilePic) {
            user.profilePic = defaultAvatar;
            await user.save();
        }

        res.status(200).json(user);
    } catch (error) {
        console.log("Error in checkAuth controller:", error.message);
        // JWT errors (expired, malformed, invalid) should return 401, not 500
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
            return res.status(401).json({ message: "Unauthorized - Token invalid or expired" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, username, about } = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        const updateData = {};

        // Handle username change
        if (username && username !== user.username) {
            const sanitizedUsername = xss(username);
            const existingUser = await User.findOne({ username: sanitizedUsername });
            if (existingUser) {
                return res.status(400).json({ message: "Username already taken" });
            }
            updateData.username = sanitizedUsername;
        }

        // Handle about update
        if (about !== undefined && about !== user.about) {
            updateData.about = xss(about.trim()).slice(0, 150);
        }

        // Handle profile picture change with monthly restriction
        if (profilePic) {
            if (user.lastProfilePicUpdate) {
                const lastUpdate = new Date(user.lastProfilePicUpdate);
                const now = new Date();
                const diffMs = now - lastUpdate;
                const diffDays = diffMs / (1000 * 60 * 60 * 24);

                if (diffDays < 30) {
                    const daysLeft = Math.ceil(30 - diffDays);
                    return res.status(400).json({
                        message: `You can change your profile picture again in ${daysLeft} day(s)`,
                    });
                }
            }

            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updateData.profilePic = uploadResponse.secure_url;
            updateData.lastProfilePicUpdate = new Date();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No changes to update" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfile controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
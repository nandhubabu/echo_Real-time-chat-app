import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        // 1. Get token from cookies (we'll set this up in login soon)
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        // 2. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        // 3. Find user but EXCLUDE the password for security
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 4. Attach user to the request object
        req.user = user;

        next(); // Move to the actual controller logic
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        // JWT errors (expired, malformed, invalid) should return 401, not 500
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
            return res.status(401).json({ message: "Unauthorized - Token invalid or expired" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};
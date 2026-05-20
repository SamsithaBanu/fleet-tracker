import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// This middleware runs BEFORE your route handler
// It checks: "does this request have a valid token?"
export const verifyToken = (req, res, next) => {

    // Get the Authorization header — should look like: "Bearer eyJhbGci..."
    const authHeader = req.headers.authorization

    // If no header — reject immediately
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Please login first.'
        })
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1]

    try {
        // Verify token is valid and not expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Attach the userId to the request object
        // Now any route after this middleware can use req.userId
        req.userId = decoded.userId

        // Call next() to move to the actual route handler
        next()

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token is invalid or expired. Please login again.'
        })
    }
}

// Middleware to check if user has the right role
export const checkRole = (...allowedRoles) => {
    return async (req, res, next) => {
        const user = await User.findById(req.userId)

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' })
        }

        // Check if this user's role is in the allowed roles list
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            })
        }

        req.user = user // attach full user object
        next()
    }
}

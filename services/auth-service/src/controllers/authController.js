import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper function — creates both tokens
const generateTokens = (userId) => {
    // Access token — short lived (15 minutes)
    const accessToken = jwt.sign(
        { userId },                        // payload — what we store inside the token
        process.env.JWT_SECRET,            // secret key to sign it
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    // Refresh token — long lived (7 days)
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    )

    return { accessToken, refreshToken }
}
export const register = async (req, res) => {
    try {
        // Get values sent from frontend form
        const { name, email, password, phone, role } = req.body

        // Check if this email already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered'
            })
        }

        // Create the user — password is auto-hashed by the pre-save hook
        const user = await User.create({ name, email, password, phone, role })

        // Generate tokens for this new user
        const { accessToken, refreshToken } = generateTokens(user._id)

        // Save refresh token to database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            }
        })

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "please provide email and password."
            })
        }
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                messsage: 'Incorrect email or password'
            })
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated'
            })
        }

        const { accessToken, refreshToken } = generateTokens(user._id)

        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false })

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                },
                accessToken,
                refreshToken,
            }
        })
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: error?.message
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req?.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        res.json({
            success: true,
            data: { user }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {
            refreshToken: null
        })

        res.json({
            success: true,
            message: 'Logged out successfully'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const refreshToken = async (req, res) => {
    try {

        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required'
            })
        }
        // Verify the refresh token is valid
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

        // Find user and check stored token matches
        const user = await User.findById(decoded.userId).select('+refreshToken')
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            })
        }

        // Issue brand new tokens
        const tokens = generateTokens(user._id)
        user.refreshToken = tokens.refreshToken
        await user.save({ validateBeforeSave: false })

        res.json({
            success: true,
            data: tokens
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Invalid or expired refresh token!'
        })
    }
}
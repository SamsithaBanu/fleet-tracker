import jwt from 'jsonwebtoken';

// Same middleware as auth-service
// Checks if request has a valid JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Please login first.'
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token is invalid or expired.'
        })
    }
}

// Check if user is admin
const isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        })
    }
    next()
}

export { verifyToken, isAdmin }
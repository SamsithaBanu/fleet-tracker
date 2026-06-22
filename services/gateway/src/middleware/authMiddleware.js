import jwt from 'jsonwebtoken';

// List of routes that do NOT need a token
// Anyone can access these without logging in

const PUBLIC_ROUTES = [
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/refresh-token' },
  { method: 'GET',  path: '/api/orders/track' },  // customer tracking
  { method: 'GET',  path: '/health' },
]

//check if this request is a public route

const isPublicRoute = (method, path)=>{
    return PUBLIC_ROUTES.some((route)=>{
        return route.method === method && path.startsWith(route.path)
    })
}

const authMiddleware =(req, res, next)=>{
  
    //skip auth check for public routes
    if (req.method === 'OPTIONS') return next()

    if(isPublicRoute(req.method, req.path)) return next();

    //Get token from authorization header 

    const authHeader = req.headers['authorization']

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            success: false,
            message:'No token provided. Please login first'
        })
    }

    const token = authHeader.split(' ')[1]

     try {
    // Verify token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user info to request headers
    // Downstream services can read these
    req.headers['x-user-id']   = decoded.userId
    req.headers['x-user-role'] = decoded.role || 'user'

    next()

  } catch (err) {
    // Token is invalid or expired
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED',
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    })
  }
};

export default authMiddleware;
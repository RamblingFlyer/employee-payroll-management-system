const jwt = require('jsonwebtoken');

// Middleware to check role
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userRole = decoded.roleID;// Assuming roleID is part of the token payload
      
      if (userRole !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this route' });
      }
    
      req.user = decoded; // Attach decoded token to request for further use
      next();
    } catch (error) {
      console.error('Authorization error:', error.message);
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  };
};

module.exports = roleMiddleware;

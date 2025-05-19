const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

// Лічильник для відстеження кількості запитів
let requestCount = 0;

// Middleware для перевірки JWT токена
module.exports = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Логуємо тільки перший успішний запит
    requestCount++;
    if (requestCount === 1) {
      console.log('First successful authentication:', { userId: decoded.userId, role: decoded.role });
    }
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware для перевірки ролі
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}; 
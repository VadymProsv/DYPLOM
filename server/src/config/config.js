require('dotenv').config();

module.exports = {
  port: 3001,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/eblago',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  corsOrigins: ['http://localhost:3000', 'http://localhost:3002'],
  jwtExpiresIn: '24h'
}; 
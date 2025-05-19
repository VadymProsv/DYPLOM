const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// All chat routes require authentication
router.use(auth);

// Get messages for an event
router.get('/events/:eventId/messages', chatController.getEventMessages);

// Send a message in an event chat
router.post('/events/:eventId/messages', chatController.sendMessage);

// Delete a message
router.delete('/messages/:messageId', chatController.deleteMessage);

// Update a message
router.put('/messages/:messageId', chatController.updateMessage);

module.exports = router; 
const Message = require('../models/Message');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// Get messages for an event
exports.getEventMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is participant or organizer
    const isParticipant = event.participants.includes(req.user.userId);
    const isOrganizer = event.organizer.toString() === req.user.userId;

    if (!isParticipant && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ event: eventId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is participant or organizer
    const isParticipant = event.participants.includes(req.user.userId);
    const isOrganizer = event.organizer.toString() === req.user.userId;

    if (!isParticipant && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = new Message({
      event: eventId,
      sender: req.user.userId,
      content
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email');

    // Emit message to all participants via Socket.IO
    req.app.get('io').to(eventId).emit('new_message', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a message
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.content = content;
    message.edited = true;
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email');

    // Emit updated message via Socket.IO
    req.app.get('io').to(message.event.toString()).emit('message_updated', updatedMessage);

    res.json(updatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const eventId = message.event;
    await message.remove();

    // Emit message deletion via Socket.IO
    req.app.get('io').to(eventId.toString()).emit('message_deleted', messageId);

    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 
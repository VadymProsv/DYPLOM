const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Оновлення дати редагування
messageSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.edited = true;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Message', messageSchema); 
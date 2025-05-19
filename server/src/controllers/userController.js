const User = require('../models/User');
const Event = require('../models/Event');
const bcrypt = require('bcryptjs');
const OrganizerRequest = require('../models/OrganizerRequest');
const fs = require('fs');
const path = require('path');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;

    // === ДОДАНО ЛОГІКУ ЗАВАНТАЖЕННЯ АВАТАРА ===
    if (req.file) {
        // Видалити старий аватар, якщо є
        if (user.avatar) {
          const oldPath = path.join(__dirname, '../../', user.avatar);
          fs.unlink(oldPath, (err) => {
             if (err) console.error('Error deleting old avatar:', oldPath, err);
          });
        }
        // Зберігаємо новий шлях до аватара
        user.avatar = `/uploads/avatars/${req.file.filename}`;
        console.log('New avatar path set:', user.avatar);
    }
    // === КІНЕЦЬ ЛОГІКИ ЗАВАНТАЖЕННЯ АВАТАРА ===

    await user.save();

    // Повертаємо оновлений об'єкт користувача
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Просто присвоюємо новий пароль, хешування зробить pre-save хук
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove user from all events they're participating in
    await Event.updateMany(
      { participants: user._id },
      { $pull: { participants: user._id } }
    );

    // Delete events organized by the user
    await Event.deleteMany({ organizer: user._id });

    // Delete the user
    await user.remove();

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user events
exports.getUserEvents = async (req, res) => {
  try {
    const organizing = await Event.find({ organizer: req.user.userId })
      .populate('organizer', 'name email')
      .populate('participants', 'name email');

    const participating = await Event.find({ participants: req.user.userId })
      .populate('organizer', 'name email')
      .populate('participants', 'name email');

    res.json({
      organizing,
      participating
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await User.countDocuments();
    const users = await User.find().select('-password').skip(skip).limit(limit);
    res.json({
      users,
      total,
      hasMore: skip + users.length < total
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const targetUser = await User.findById(req.params.id).select('-password');
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(targetUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    targetUser.role = role;
    await targetUser.save();

    res.json(targetUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Створення заявки на організатора
exports.createOrganizerRequest = async (req, res) => {
  try {
    const { organizationName, phone, email, message } = req.body;
    const userId = req.user.userId;
    const request = new OrganizerRequest({
      userId,
      organizationName,
      phone,
      email,
      message
    });
    await request.save();
    res.status(201).json({ message: 'Request submitted', request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Block user
exports.blockUser = async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (targetUser.isBlocked) {
      return res.status(400).json({ message: 'User is already blocked' });
    }
    targetUser.isBlocked = true;
    await targetUser.save();
    res.json({ message: 'User blocked', user: targetUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!targetUser.isBlocked) {
      return res.status(400).json({ message: 'User is not blocked' });
    }
    targetUser.isBlocked = false;
    await targetUser.save();
    res.json({ message: 'User unblocked', user: targetUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 
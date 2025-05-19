const OrganizerRequest = require('../models/OrganizerRequest');
const User = require('../models/User');

// Отримати всі заявки
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await OrganizerRequest.find().populate('userId', 'name email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Отримати заявку за ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await OrganizerRequest.findById(req.params.id).populate('userId', 'name email');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Схвалити заявку
exports.approveRequest = async (req, res) => {
  try {
    const request = await OrganizerRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    request.status = 'approved';
    await request.save();
    // Оновити роль користувача
    await User.findByIdAndUpdate(request.userId, { role: 'organizer' });
    res.json({ message: 'Request approved', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Відхилити заявку
exports.rejectRequest = async (req, res) => {
  try {
    const request = await OrganizerRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    request.status = 'rejected';
    await request.save();
    res.json({ message: 'Request rejected', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 
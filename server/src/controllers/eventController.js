const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Створення нової події
exports.createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category,
      startDate,
      endDate,
      location,
      maxParticipants 
    } = req.body;

    let image = null;
    if (req.file) {
      image = `/uploads/events/${req.file.filename}`;
    }

    const event = new Event({
      title,
      description,
      category,
      startDate,
      endDate,
      location: typeof location === 'string' ? JSON.parse(location) : location,
      maxParticipants,
      organizer: req.user.userId,
      image
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email avatar');

    res.status(201).json(populatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Отримання всіх подій
exports.getEvents = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ startDate: 1 });
    events = events.map(e => {
      const obj = e.toObject();
      obj.status = e.statusAuto;
      return obj;
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// Отримання події за ID
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('participants', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const obj = event.toObject();
    obj.status = event.statusAuto;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event' });
  }
};

// Оновлення події
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    const isAdmin = req.user.role === 'admin';
    if (event.organizer.toString() !== req.user.userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { 
      title, 
      description, 
      category,
      startDate,
      endDate,
      location,
      maxParticipants,
      status 
    } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (location) event.location = typeof location === 'string' ? JSON.parse(location) : location;
    if (maxParticipants) event.maxParticipants = maxParticipants;
    if (status) event.status = status;

    // Якщо є новий файл — видалити старий, зберегти новий
    if (req.file) {
      if (event.image) {
        const oldPath = path.join(__dirname, '../../', event.image);
        fs.unlink(oldPath, (err) => {}); // ігноруємо помилку
      }
      event.image = `/uploads/events/${req.file.filename}`;
    }
    // Якщо користувач хоче видалити фото
    if (req.body.removeImage === 'true' && event.image) {
      const oldPath = path.join(__dirname, '../../', event.image);
      fs.unlink(oldPath, (err) => {});
      event.image = null;
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email avatar')
      .populate('participants', 'name email avatar');

    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Видалення події
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    const isAdmin = req.user.role === 'admin';
    if (event.organizer.toString() !== req.user.userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Реєстрація на подію
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    if (event.participants.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already registered' });
    }

    event.participants.push(req.user.userId);
    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email avatar')
      .populate('participants', 'name email avatar');

    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Скасування реєстрації на подію
exports.unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered
    const participantIndex = event.participants.indexOf(req.user.userId);
    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    event.participants.splice(participantIndex, 1);
    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email avatar')
      .populate('participants', 'name email avatar');

    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await Event.countDocuments();
    let events = await Event.find()
      .populate('organizer', 'name email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);
    events = events.map(e => {
      const obj = e.toObject();
      obj.status = e.statusAuto;
      return obj;
    });
    res.json({
      events,
      total,
      hasMore: skip + events.length < total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar')
      .populate('participants', 'name email avatar');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const obj = event.toObject();
    obj.status = event.statusAuto;
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}; 
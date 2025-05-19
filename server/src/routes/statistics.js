const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');

// GET /api/statistics
router.get('/', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'ongoing' });
    const completedEvents = await Event.countDocuments({ status: 'completed' });
    const totalParticipantsArr = await Event.aggregate([
      { $unwind: '$participants' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const totalParticipants = totalParticipantsArr[0]?.count || 0;
    const categoryStatsArr = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const categoryStats = {};
    categoryStatsArr.forEach(c => categoryStats[c._id] = c.count);

    // Додаткові метрики
    const events = await Event.find();
    // Тривалість подій у днях
    const eventDurations = events.map(e => Math.max(1, Math.ceil((e.endDate - e.startDate) / (1000 * 60 * 60 * 24))));
    // Кількість учасників на подію
    const participantsPerEvent = events.map(e => e.participants.length);
    // Відсоток заповненості подій
    const fillRates = events.map(e => e.maxParticipants ? (e.participants.length / e.maxParticipants) : 0);
    // Події по місяцях
    const eventsByMonth = {};
    events.forEach(e => {
      const month = e.startDate.getFullYear() + '-' + String(e.startDate.getMonth() + 1).padStart(2, '0');
      eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;
    });
    // Кількість організаторів
    const organizersCount = await User.countDocuments({ role: 'organizer' });
    // Середня тривалість події
    const avgDuration = eventDurations.length ? (eventDurations.reduce((a, b) => a + b, 0) / eventDurations.length) : 0;
    // Середня кількість учасників на подію
    const avgParticipants = participantsPerEvent.length ? (participantsPerEvent.reduce((a, b) => a + b, 0) / participantsPerEvent.length) : 0;
    // Середній відсоток заповненості подій
    const avgFillRate = fillRates.length ? (fillRates.reduce((a, b) => a + b, 0) / fillRates.length) : 0;
    // Середня кількість відвіданих подій на користувача
    const avgEventsPerUser = totalUsers ? (totalParticipants / totalUsers) : 0;

    res.json({
      totalUsers,
      totalEvents,
      activeEvents,
      completedEvents,
      totalParticipants,
      categoryStats,
      eventDurations,
      participantsPerEvent,
      eventsByMonth,
      organizersCount,
      avgDuration,
      avgParticipants,
      avgFillRate,
      avgEventsPerUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

module.exports = router; 
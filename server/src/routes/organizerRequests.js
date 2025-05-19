const express = require('express');
const router = express.Router();
const controller = require('../controllers/organizerRequestController');
const auth = require('../middleware/auth');

// Всі маршрути захищені (тільки для адміна)
router.use(auth);

router.get('/', controller.getAllRequests);
router.get('/:id', controller.getRequestById);
router.put('/:id/approve', controller.approveRequest);
router.put('/:id/reject', controller.rejectRequest);

module.exports = router; 
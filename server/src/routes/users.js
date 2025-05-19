const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const uploadAvatar = require('../middleware/uploadAvatar');

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, uploadAvatar.single('avatar'), userController.updateProfile);
router.put('/password', auth, userController.changePassword);
router.delete('/account', auth, userController.deleteAccount);
router.get('/events', auth, userController.getUserEvents);
router.post('/organizer-request', auth, userController.createOrganizerRequest);

// Admin routes
router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/:id/role', auth, userController.updateUserRole);
router.put('/:id/block', auth, userController.blockUser);
router.put('/:id/unblock', auth, userController.unblockUser);

module.exports = router; 
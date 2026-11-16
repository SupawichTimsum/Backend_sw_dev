const express = require('express');

const {getNotifications, markAsRead, markAllAsRead, deleteNotification} = require('../controllers/notifications');

const router = express.Router();

const {protect}= require('../middleware/auth');

router.route('/').get(protect, getNotifications);
router.route('/read-all').put(protect, markAllAsRead);
router.route('/:id/read').put(protect, markAsRead);
router.route('/:id').delete(protect, deleteNotification);

module.exports=router;

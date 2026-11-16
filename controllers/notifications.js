const Notification = require('../models/Notification');
const { t, massageTypeLabel, formatDate } = require('../utils/i18n');
const { checkUpcomingReservations } = require('../utils/notificationScheduler');
const handleError = require('../utils/errorResponse');

//Build the reminder message in the user's language
const formatNotification = (req, notification) => ({
    _id: notification._id,
    message: t(req, 'notif.reminder', {
        type: massageTypeLabel(req, notification.massageType),
        duration: notification.duration,
        shop: notification.massageShop ? notification.massageShop.name : '-',
        date: formatDate(req, notification.resvDate)
    }),
    reservation: notification.reservation,
    massageShop: notification.massageShop,
    resvDate: notification.resvDate,
    isRead: notification.isRead,
    createdAt: notification.createdAt
});

//@desc     Get my notifications (?unread=true for unread only)
//@route    GET /api/v1/notifications
//@access   Private
exports.getNotifications = async (req, res, next) => {
    try {
        //Check right away so new reminders appear without waiting for the scheduler
        await checkUpcomingReservations(req.user.id);

        const filter = { user: req.user.id };
        if (req.query.unread === 'true') {
            filter.isRead = false;
        }

        const notifications = await Notification.find(filter)
            .populate({ path: 'massageShop', select: 'name address tel' })
            .sort('-createdAt');

        const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications.map(n => formatNotification(req, n))
        });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'notif.fetchFailed');
    }
};

//@desc     Mark one notification as read
//@route    PUT /api/v1/notifications/:id/read
//@access   Private
exports.markAsRead = async (req, res, next) => {
    try {
        let notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: t(req,'notif.notFound',{id:req.params.id}) });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: t(req,'notif.notOwner',{id:req.user.id}) });
        }

        notification.isRead = true;
        await notification.save();
        await notification.populate({ path: 'massageShop', select: 'name address tel' });

        res.status(200).json({
            success: true,
            message: t(req,'notif.markedRead'),
            data: formatNotification(req, notification)
        });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'notif.updateFailed');
    }
};

//@desc     Mark all my notifications as read
//@route    PUT /api/v1/notifications/read-all
//@access   Private
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });

        res.status(200).json({ success: true, message: t(req,'notif.allMarkedRead'), data: {} });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'notif.updateFailed');
    }
};

//@desc     Delete a notification
//@route    DELETE /api/v1/notifications/:id
//@access   Private
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: t(req,'notif.notFound',{id:req.params.id}) });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: t(req,'notif.notOwner',{id:req.user.id}) });
        }

        await notification.deleteOne();

        res.status(200).json({ success: true, message: t(req,'notif.deleted'), data: {} });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'notif.deleteFailed');
    }
};

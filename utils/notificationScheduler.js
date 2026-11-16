const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');

//Create a reminder for every reservation that starts within NOTIFY_BEFORE_HOURS
//and has not been notified yet. Pass userId to check only one user's reservations.
const checkUpcomingReservations = async (userId) => {
    const now = new Date();
    const hoursBefore = Number(process.env.NOTIFY_BEFORE_HOURS) || 24;
    const notifyUntil = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);

    const filter = {
        notified: false,
        resvDate: { $gt: now, $lte: notifyUntil }
    };
    if (userId) {
        filter.user = userId;
    }

    const reservations = await Reservation.find(filter).select('_id');
    let created = 0;

    for (const { _id } of reservations) {
        //Mark as notified atomically so the same reservation is never notified twice
        const reservation = await Reservation.findOneAndUpdate(
            { _id, notified: false },
            { notified: true },
            { returnDocument: 'after' }
        );
        if (!reservation) {
            continue;
        }

        await Notification.create({
            user: reservation.user,
            reservation: reservation._id,
            massageShop: reservation.massageShop,
            resvDate: reservation.resvDate,
            massageType: reservation.massageType,
            duration: reservation.duration
        });
        created++;
    }

    return created;
};

//Run the check repeatedly in the background
const startNotificationScheduler = () => {
    const intervalMinutes = Number(process.env.NOTIFY_CHECK_INTERVAL_MINUTES) || 1;

    setInterval(async () => {
        try {
            const created = await checkUpcomingReservations();
            if (created > 0) {
                console.log(`Created ${created} reservation reminder(s)`);
            }
        } catch (err) {
            console.log(`Notification scheduler error: ${err.message}`);
        }
    }, intervalMinutes * 60 * 1000);

    console.log(`Notification scheduler started (every ${intervalMinutes} min, ${Number(process.env.NOTIFY_BEFORE_HOURS) || 24} hr before reservation)`);
};

module.exports = { checkUpcomingReservations, startNotificationScheduler };

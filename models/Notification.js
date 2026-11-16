const mongoose = require('mongoose');

//In-app reminder before a reservation
//The message text is built when it is read, so it follows the user's language
const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    reservation: {
        type: mongoose.Schema.ObjectId,
        ref: 'Reservation',
        required: true
    },
    massageShop: {
        type: mongoose.Schema.ObjectId,
        ref: 'MassageShop',
        required: true
    },
    resvDate: {
        type: Date,
        required: true
    },
    massageType: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);

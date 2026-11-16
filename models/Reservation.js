const mongoose = require('mongoose');

const ReservationSchema=new mongoose.Schema({
    resvDate: {
        type: Date,
        required: [true, 'validation.resv.dateRequired']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    massageShop:{
        type:mongoose.Schema.ObjectId,
        ref: 'MassageShop',
        required:true
    },
    //Selected package (copied from the shop when reserving)
    massageType: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    //Reminder notification has been created
    notified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//Condition for "active/upcoming" reservations: the massage has not finished yet
//(resvDate + duration minutes > now)
ReservationSchema.statics.activeCondition = function() {
    return {
        $expr: {
            $gt: [
                { $add: ['$resvDate', { $multiply: ['$duration', 60 * 1000] }] },
                new Date()
            ]
        }
    };
};

module.exports=mongoose.model('Reservation',ReservationSchema);

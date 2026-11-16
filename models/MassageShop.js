const mongoose = require('mongoose');

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

//Massage type/package with duration and price
const PackageSchema = new mongoose.Schema({
    massageType: {
        type: String,
        required: [true, 'validation.package.massageTypeRequired'],
        lowercase: true,
        enum: {
            values: ['thai', 'oil', 'foot', 'aroma', 'herbal'],
            message: 'validation.package.massageTypeEnum'
        }
    },
    duration: {
        type: Number,
        required: [true, 'validation.package.durationRequired'],
        min: [15, 'validation.package.durationMin']
    },
    price: {
        type: Number,
        required: [true, 'validation.package.priceRequired'],
        min: [0, 'validation.package.priceMin']
    }
}, { _id: false });

const MassageShopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'validation.shop.nameRequired'],
        unique: true,
        trim: true,
        maxlength: [50, 'validation.shop.nameMax']
    },
    address: {
        type: String,
        required: [true, 'validation.shop.addressRequired']
    },
    tel: {
        type: String,
        required: [true, 'validation.shop.telRequired']
    },
    openTime: {
        type: String,
        required: [true, 'validation.shop.openTimeRequired'],
        match: [TIME_REGEX, 'validation.shop.timeInvalid']
    },
    closeTime: {
        type: String,
        required: [true, 'validation.shop.closeTimeRequired'],
        match: [TIME_REGEX, 'validation.shop.timeInvalid']
    },
    packages: {
        type: [PackageSchema],
        validate: {
            validator: (v) => Array.isArray(v) && v.length > 0,
            message: 'validation.shop.packagesRequired'
        }
    },
    //Calculated from reviews (see Review.calcAverageRating)
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{
    toJSON: {virtuals:true},
    toObject:{virtuals:true}
});

//Reverse populate with virtuals
MassageShopSchema.virtual('reservations',{
    ref: 'Reservation',
    localField: '_id',
    foreignField:'massageShop',
    justOne:false
});

MassageShopSchema.virtual('reviews',{
    ref: 'Review',
    localField: '_id',
    foreignField:'massageShop',
    justOne:false
});

//Find the package that matches massage type + duration
MassageShopSchema.methods.findPackage = function(massageType, duration) {
    return this.packages.find(p =>
        p.massageType === String(massageType).toLowerCase() && p.duration === Number(duration)
    );
};

module.exports = mongoose.model('MassageShop', MassageShopSchema);

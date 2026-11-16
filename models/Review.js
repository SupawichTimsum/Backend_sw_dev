const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: [true, 'validation.review.ratingRequired'],
        min: [1, 'validation.review.ratingRange'],
        max: [5, 'validation.review.ratingRange']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'validation.review.commentMax']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    massageShop: {
        type: mongoose.Schema.ObjectId,
        ref: 'MassageShop',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//One review per user per massage shop
ReviewSchema.index({ massageShop: 1, user: 1 }, { unique: true });

//Recalculate average rating and number of reviews of a massage shop
ReviewSchema.statics.calcAverageRating = async function(massageShopId) {
    const stats = await this.aggregate([
        { $match: { massageShop: new mongoose.Types.ObjectId(massageShopId) } },
        {
            $group: {
                _id: '$massageShop',
                averageRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    const update = stats.length > 0
        ? { averageRating: Math.round(stats[0].averageRating * 10) / 10, numReviews: stats[0].numReviews }
        : { averageRating: 0, numReviews: 0 };

    await mongoose.model('MassageShop').findByIdAndUpdate(massageShopId, update);
};

module.exports = mongoose.model('Review', ReviewSchema);

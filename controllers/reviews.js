const Review = require('../models/Review');
const MassageShop = require('../models/MassageShop');
const Reservation = require('../models/Reservation');
const { t } = require('../utils/i18n');
const handleError = require('../utils/errorResponse');

//@desc     Get reviews (of one massage shop or all)
//@route    GET /api/v1/reviews
//@route    GET /api/v1/massageshops/:massageShopId/reviews
//@access   Public
exports.getReviews = async (req, res, next) => {
    try {
        if (req.params.massageShopId) {
            const massageShop = await MassageShop.findById(req.params.massageShopId);
            if (!massageShop) {
                return res.status(404).json({ success: false, message: t(req,'shop.notFound',{id:req.params.massageShopId}) });
            }

            const reviews = await Review.find({ massageShop: req.params.massageShopId })
                .populate({ path: 'user', select: 'name' })
                .sort('-createdAt');

            return res.status(200).json({
                success: true,
                massageShop: { id: massageShop._id, name: massageShop.name },
                averageRating: massageShop.averageRating,
                numReviews: massageShop.numReviews,
                count: reviews.length,
                data: reviews
            });
        }

        const reviews = await Review.find()
            .populate({ path: 'user', select: 'name' })
            .populate({ path: 'massageShop', select: 'name averageRating numReviews' })
            .sort('-createdAt');

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'review.fetchFailed');
    }
};

//@desc     Get single review
//@route    GET /api/v1/reviews/:id
//@access   Public
exports.getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate({ path: 'user', select: 'name' })
            .populate({ path: 'massageShop', select: 'name averageRating numReviews' });

        if (!review) {
            return res.status(404).json({ success: false, message: t(req,'review.notFound',{id:req.params.id}) });
        }

        res.status(200).json({ success: true, data: review });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'review.fetchFailed');
    }
};

//@desc     Add review (only users who already had a reservation at this shop)
//@route    POST /api/v1/massageshops/:massageShopId/reviews
//@access   Private
exports.addReview = async (req, res, next) => {
    try {
        const shopId = req.params.massageShopId || req.body.massageShop;
        const massageShop = await MassageShop.findById(shopId);
        if (!massageShop) {
            return res.status(404).json({ success: false, message: t(req,'shop.notFound',{id:shopId}) });
        }

        //Must have a reservation at this shop that has already started
        const pastReservation = await Reservation.findOne({
            user: req.user.id,
            massageShop: massageShop._id,
            resvDate: { $lte: new Date() }
        });
        if (!pastReservation) {
            return res.status(403).json({ success: false, message: t(req,'review.notEligible') });
        }

        //One review per shop
        const existed = await Review.findOne({ user: req.user.id, massageShop: massageShop._id });
        if (existed) {
            return res.status(400).json({ success: false, message: t(req,'review.alreadyReviewed') });
        }

        const review = await Review.create({
            rating: req.body.rating,
            comment: req.body.comment,
            user: req.user.id,
            massageShop: massageShop._id
        });

        await Review.calcAverageRating(massageShop._id);

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: t(req,'review.alreadyReviewed') });
        }
        return handleError(err, req, res, 'review.createFailed');
    }
};

//@desc     Update review
//@route    PUT /api/v1/reviews/:id
//@access   Private
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: t(req,'review.notFound',{id:req.params.id}) });
        }

        //Make sure user is the review owner
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: t(req,'review.notOwnerUpdate',{id:req.user.id}) });
        }

        //Only rating and comment can be changed
        const fieldsToUpdate = {};
        ['rating', 'comment'].forEach(field => {
            if (req.body[field] !== undefined) {
                fieldsToUpdate[field] = req.body[field];
            }
        });

        review = await Review.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
            returnDocument: 'after',
            runValidators: true
        });

        await Review.calcAverageRating(review.massageShop);

        res.status(200).json({ success: true, data: review });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'review.updateFailed');
    }
};

//@desc     Delete review
//@route    DELETE /api/v1/reviews/:id
//@access   Private
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: t(req,'review.notFound',{id:req.params.id}) });
        }

        //Make sure user is the review owner
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: t(req,'review.notOwnerDelete',{id:req.user.id}) });
        }

        const massageShopId = review.massageShop;
        await review.deleteOne();
        await Review.calcAverageRating(massageShopId);

        res.status(200).json({ success: true, message: t(req,'review.deleted'), data: {} });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'review.deleteFailed');
    }
};

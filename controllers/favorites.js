const User = require('../models/User');
const MassageShop = require('../models/MassageShop');
const { t } = require('../utils/i18n');
const handleError = require('../utils/errorResponse');

//Fields shown for favorite shops (enough to make a reservation quickly)
const FAVORITE_FIELDS = 'name address tel openTime closeTime packages averageRating numReviews';

//@desc     Get my favorite massage shops
//@route    GET /api/v1/favorites
//@access   Private
exports.getFavorites = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'favorites',
            select: FAVORITE_FIELDS
        });

        res.status(200).json({
            success: true,
            count: user.favorites.length,
            data: user.favorites
        });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'fav.fetchFailed');
    }
};

//@desc     Add a massage shop to favorites
//@route    POST /api/v1/favorites/:massageShopId
//@access   Private
exports.addFavorite = async (req, res, next) => {
    try {
        const massageShop = await MassageShop.findById(req.params.massageShopId);
        if (!massageShop) {
            return res.status(404).json({ success: false, message: t(req,'shop.notFound',{id:req.params.massageShopId}) });
        }

        if (req.user.favorites.some(id => id.toString() === massageShop.id)) {
            return res.status(400).json({ success: false, message: t(req,'fav.alreadyExists') });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { favorites: massageShop._id } },
            { returnDocument: 'after' }
        ).populate({ path: 'favorites', select: FAVORITE_FIELDS });

        res.status(200).json({
            success: true,
            message: t(req,'fav.added'),
            count: user.favorites.length,
            data: user.favorites
        });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'fav.updateFailed');
    }
};

//@desc     Remove a massage shop from favorites
//@route    DELETE /api/v1/favorites/:massageShopId
//@access   Private
exports.removeFavorite = async (req, res, next) => {
    try {
        if (!req.user.favorites.some(id => id.toString() === req.params.massageShopId)) {
            return res.status(404).json({ success: false, message: t(req,'fav.notInList') });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { favorites: req.params.massageShopId } },
            { returnDocument: 'after' }
        ).populate({ path: 'favorites', select: FAVORITE_FIELDS });

        res.status(200).json({
            success: true,
            message: t(req,'fav.removed'),
            count: user.favorites.length,
            data: user.favorites
        });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'fav.updateFailed');
    }
};

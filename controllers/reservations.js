const Reservation = require('../models/Reservation');
const MassageShop = require('../models/MassageShop');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { t, massageTypeLabel } = require('../utils/i18n');
const { isWithinOpeningHours } = require('../utils/openingHours');
const handleError = require('../utils/errorResponse');

const MAX_RESERVATIONS = 3;

//Check date, package and opening hours of a reservation
//Returns { error: {status, message} } or { date, pkg }
const validateReservation = (req, shop, { resvDate, massageType, duration }) => {
    if (!resvDate || !massageType || !duration) {
        return { error: { status: 400, message: t(req, 'resv.missingFields') } };
    }

    const date = new Date(resvDate);
    if (isNaN(date.getTime())) {
        return { error: { status: 400, message: t(req, 'resv.invalidDate') } };
    }

    //Admin may record past reservations (e.g. walk-in customers)
    if (date <= new Date() && req.user.role !== 'admin') {
        return { error: { status: 400, message: t(req, 'resv.dateInPast') } };
    }

    const pkg = shop.findPackage(massageType, duration);
    if (!pkg) {
        return {
            error: {
                status: 400,
                message: t(req, 'package.notFound', {
                    shop: shop.name,
                    type: massageTypeLabel(req, String(massageType).toLowerCase()),
                    duration
                })
            }
        };
    }

    if (!isWithinOpeningHours(shop, date, pkg.duration)) {
        return {
            error: {
                status: 400,
                message: t(req, 'resv.outsideHours', { open: shop.openTime, close: shop.closeTime })
            }
        };
    }

    return { date, pkg };
};

//Check the 3 active/upcoming reservations limit (admin has no limit)
const isOverLimit = async (req, userId) => {
    if (req.user.role === 'admin') {
        return false;
    }
    const activeCount = await Reservation.countDocuments({
        user: userId,
        ...Reservation.activeCondition()
    });
    return activeCount >= MAX_RESERVATIONS;
};

//@desc     Get all reservations
//@route    GET /api/v1/reservations
//@route    GET /api/v1/massageshops/:massageShopId/reservations
//@access   Private
exports.getReservations=async (req,res,next)=>{
    let query;
    const filter = {};

    if (req.params.massageShopId) {
        filter.massageShop = req.params.massageShopId;
    }

    //General users can see only their reservations!
    if(req.user.role !== 'admin'){
        filter.user = req.user.id;
        query=Reservation.find(filter).populate({
            path: 'massageShop',
            select: 'name address tel openTime closeTime'
        });
    }else{ //If you are an admin, you can see all!
        query=Reservation.find(filter).populate({
            path: 'massageShop',
            select: 'name address tel openTime closeTime'
        }).populate({
            path: 'user',
            select: 'name tel email'
        });
    }

    try {
        const reservations= await query.sort('resvDate');

        res.status(200).json({
            success:true,
            count:reservations.length,
            data: reservations
        });
    } catch (error) {
        console.log(error);
        return handleError(error, req, res, 'resv.fetchFailed');
    }
};

//@desc     Get single reservation
//@route    GET /api/v1/reservations/:id
//@access   Private
exports.getReservation=async (req,res,next)=>{
    try {
        const reservation= await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success:false,message:t(req,'resv.notFound',{id:req.params.id})});
        }

        //Make sure user is the reservation owner
        if(reservation.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:t(req,'resv.notOwnerView',{id:req.user.id})});
        }

        await reservation.populate([
            { path: 'massageShop', select: 'name address tel openTime closeTime' },
            { path: 'user', select: 'name tel email' }
        ]);

        res.status(200).json({
            success:true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return handleError(error, req, res, 'resv.fetchFailed');
    }
};

//@desc     Preview price of a reservation before confirming (nothing is saved)
//@route    POST /api/v1/massageshops/:massageShopId/reservations/preview
//@access   Private
exports.previewReservation=async (req,res,next)=>{
    try {
        const shopId = req.params.massageShopId || req.body.massageShop;
        const massageShop = await MassageShop.findById(shopId);
        if (!massageShop) {
            return res.status(404).json({ success: false, message: t(req,'shop.notFound',{id:shopId}) });
        }

        const result = validateReservation(req, massageShop, req.body);
        if (result.error) {
            return res.status(result.error.status).json({ success: false, message: result.error.message });
        }

        const { date, pkg } = result;

        res.status(200).json({
            success:true,
            message: t(req,'resv.preview',{price:pkg.price, shopId:massageShop._id}),
            data: {
                massageShop: { id: massageShop._id, name: massageShop.name },
                resvDate: date,
                massageType: pkg.massageType,
                massageTypeLabel: massageTypeLabel(req, pkg.massageType),
                duration: pkg.duration,
                price: pkg.price,
                currency: 'THB'
            }
        });
    } catch (error) {
        console.log(error);
        return handleError(error, req, res, 'resv.createFailed');
    }
};

//@desc     Add reservation
//@route    POST /api/v1/massageshops/:massageShopId/reservations
//@access   Private
exports.addReservation=async (req,res,next)=>{
    try {
        const shopId = req.params.massageShopId || req.body.massageShop;
        const massageShop = await MassageShop.findById(shopId);
        if (!massageShop) {
            return res.status(404).json({ success: false, message: t(req,'shop.notFound',{id:shopId}) });
        }

        //Admin can make a reservation for another user, others reserve for themselves
        let userId = req.user.id;
        if (req.user.role === 'admin' && req.body.user) {
            const user = await User.findById(req.body.user);
            if (!user) {
                return res.status(404).json({ success: false, message: t(req,'resv.userNotFound',{id:req.body.user}) });
            }
            userId = user.id;
        }

        const result = validateReservation(req, massageShop, req.body);
        if (result.error) {
            return res.status(result.error.status).json({ success: false, message: result.error.message });
        }

        //If the user is not an admin, they can only have 3 active/upcoming reservations
        if (await isOverLimit(req, userId)) {
            return res.status(400).json({success:false,message:t(req,'resv.limitReached',{id:userId})});
        }

        const { date, pkg } = result;

        //Price always comes from the shop package, not from the request body
        const reservation = await Reservation.create({
            resvDate: date,
            user: userId,
            massageShop: massageShop._id,
            massageType: pkg.massageType,
            duration: pkg.duration,
            price: pkg.price
        });

        res.status(201).json({
            success:true,
            message: t(req,'resv.created',{price:pkg.price}),
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return handleError(error, req, res, 'resv.createFailed');
    }
};

//@desc     Update reservation
//@route    PUT /api/v1/reservations/:id
//@access   Private
exports.updateReservation=async (req,res,next)=>{
    try {
        let reservation= await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success:false,message:t(req,'resv.notFound',{id:req.params.id})});
        }

        //Make sure user is the reservation owner
        if(reservation.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:t(req,'resv.notOwnerUpdate',{id:req.user.id})});
        }

        //Use new values from body, otherwise keep the old ones
        const shopId = req.body.massageShop || reservation.massageShop;
        const massageShop = await MassageShop.findById(shopId);
        if (!massageShop) {
            return res.status(404).json({ success: false, message: t(req,'shop.notFound',{id:shopId}) });
        }

        const result = validateReservation(req, massageShop, {
            resvDate: req.body.resvDate || reservation.resvDate,
            massageType: req.body.massageType || reservation.massageType,
            duration: req.body.duration || reservation.duration
        });
        if (result.error) {
            return res.status(result.error.status).json({ success: false, message: result.error.message });
        }

        const { date, pkg } = result;
        const update = {
            resvDate: date,
            massageShop: massageShop._id,
            massageType: pkg.massageType,
            duration: pkg.duration,
            price: pkg.price
        };

        //Date changed -> old reminder is no longer correct, remind again later
        if (date.getTime() !== reservation.resvDate.getTime()) {
            update.notified = false;
            await Notification.deleteMany({ reservation: reservation._id });
        }

        reservation=await Reservation.findByIdAndUpdate(req.params.id,update,{
            returnDocument: 'after',
            runValidators:true
        });

        res.status(200).json({
            success:true,
            message: t(req,'resv.updated',{price:pkg.price}),
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return handleError(error, req, res, 'resv.updateFailed');
    }
};

//@desc     Delete reservation
//@route    DELETE /api/v1/reservations/:id
//@access   Private
exports.deleteReservation=async (req,res,next)=>{
    try {
        const reservation= await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success:false,message:t(req,'resv.notFound',{id:req.params.id})});
        }

        //Make sure user is the reservation owner
        if(reservation.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:t(req,'resv.notOwnerDelete',{id:req.user.id})});
        }

        await Notification.deleteMany({ reservation: reservation._id });
        await reservation.deleteOne();

        res.status(200).json({
            success:true,
            message: t(req,'resv.deleted'),
            data: {}
        });
    } catch (error) {
        console.log(error);
        return handleError(error, req, res, 'resv.deleteFailed');
    }
};

const MassageShop = require('../models/MassageShop');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { t, massageTypeLabel } = require('../utils/i18n');
const handleError = require('../utils/errorResponse');

//@desc     Get all massage shops
//@route    GET /api/v1/massageshops
//@access   Public
exports.getMassageShops= async(req,res,next)=>{
    let query;
    //Copy req.query
    const reqQuery= {...req.query};

    //Fields to exclude
    const removeFields=['select','sort','page','limit','lang'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);

    //Create operators ($gt, $gte, etc)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    const filter = JSON.parse(queryStr);

    query = MassageShop.find(filter);

    //Select Fields
    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    //Sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    } else{
        query=query.sort('-createdAt');
    }

    //Pagination
    const page=parseInt(req.query.page,10)|| 1;
    const limit=parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;

    try{
        const total=await MassageShop.countDocuments(filter);

        query=query.skip(startIndex).limit(limit);
        const massageShops = await query;

        const pagination ={};

        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }

        res.status(200).json({success:true, count:massageShops.length, pagination, data:massageShops});
    }catch(err){
        console.log(err);
        return handleError(err, req, res, 'shop.fetchFailed');
    }
};

//@desc     Get single massage shop (with average rating and reviews)
//@route    GET /api/v1/massageshops/:id
//@access   Public
exports.getMassageShop= async (req,res,next)=>{
    try{
        const massageShop = await MassageShop.findById(req.params.id).populate({
            path: 'reviews',
            select: 'rating comment user createdAt',
            options: { sort: '-createdAt' },
            populate: { path: 'user', select: 'name' }
        });

        if(!massageShop){
            return res.status(404).json({success:false, message:t(req,'shop.notFound',{id:req.params.id})});
        }

        res.status(200).json({success:true, data:massageShop});
    }catch(err){
        console.log(err);
        return handleError(err, req, res, 'shop.fetchFailed');
    }
};

//@desc     Get massage types/packages with price of a massage shop
//@route    GET /api/v1/massageshops/:id/packages
//@access   Public
exports.getMassageShopPackages= async (req,res,next)=>{
    try{
        const massageShop = await MassageShop.findById(req.params.id);

        if(!massageShop){
            return res.status(404).json({success:false, message:t(req,'shop.notFound',{id:req.params.id})});
        }

        const packages = massageShop.packages.map(p => ({
            massageType: p.massageType,
            massageTypeLabel: massageTypeLabel(req, p.massageType),
            duration: p.duration,
            price: p.price,
            currency: 'THB'
        }));

        res.status(200).json({
            success:true,
            count:packages.length,
            massageShop:{ id: massageShop._id, name: massageShop.name, openTime: massageShop.openTime, closeTime: massageShop.closeTime },
            data:packages
        });
    }catch(err){
        console.log(err);
        return handleError(err, req, res, 'shop.fetchFailed');
    }
};

//@desc     Create new massage shop
//@route    POST /api/v1/massageshops
//@access   Private (admin)
exports.createMassageShop=async(req,res,next)=>{
    try{
        //Rating is calculated from reviews only
        delete req.body.averageRating;
        delete req.body.numReviews;

        const massageShop = await MassageShop.create(req.body);
        res.status(201).json({success:true, data:massageShop});
    }catch(err){
        console.log(err);
        return handleError(err, req, res, 'shop.createFailed');
    }
};

//@desc     Update massage shop
//@route    PUT /api/v1/massageshops/:id
//@access   Private (admin)
exports.updateMassageShop = async (req, res, next) => {
    try {
        delete req.body.averageRating;
        delete req.body.numReviews;

        const massageShop = await MassageShop.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!massageShop) {
            return res.status(404).json({ success: false, message: t(req,'shop.notFound',{id:req.params.id}) });
        }

        res.status(200).json({ success: true, data: massageShop });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'shop.updateFailed');
    }
};

//@desc     Delete massage shop (only when it has no active/upcoming reservations)
//@route    DELETE /api/v1/massageshops/:id
//@access   Private (admin)
exports.deleteMassageShop = async (req, res, next) => {
    try {
        const massageShop = await MassageShop.findById(req.params.id);

        if (!massageShop) {
            return res.status(404).json({ success: false, message: t(req,'shop.notFound',{id:req.params.id}) });
        }

        //Block delete if any reservation has not finished yet
        const activeCount = await Reservation.countDocuments({
            massageShop: req.params.id,
            ...Reservation.activeCondition()
        });

        if (activeCount > 0) {
            return res.status(400).json({
                success: false,
                message: t(req,'shop.hasActiveReservations',{count:activeCount})
            });
        }

        //Cascade delete: past reservations, their notifications, reviews, favorites
        const reservations = await Reservation.find({ massageShop: req.params.id }).select('_id');
        await Notification.deleteMany({ reservation: { $in: reservations.map(r => r._id) } });
        await Reservation.deleteMany({ massageShop: req.params.id });
        await Review.deleteMany({ massageShop: req.params.id });
        await User.updateMany({ favorites: req.params.id }, { $pull: { favorites: req.params.id } });
        await MassageShop.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, message: t(req,'shop.deleted'), data: {} });
    } catch (err) {
        console.log(err);
        return handleError(err, req, res, 'shop.deleteFailed');
    }
};

const express = require('express');

const {getReservations, getReservation, previewReservation, addReservation, updateReservation, deleteReservation} = require('../controllers/reservations');

const router = express.Router({mergeParams:true});

const {protect, authorize}= require('../middleware/auth');

router.route('/').get(protect, getReservations).post(protect, authorize('admin','user'), addReservation);
router.route('/preview').post(protect, authorize('admin','user'), previewReservation);
router.route('/:id').get(protect, getReservation).put(protect, authorize('admin','user'), updateReservation).delete(protect, authorize('admin','user'), deleteReservation);

module.exports=router;

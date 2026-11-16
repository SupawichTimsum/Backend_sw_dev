const express = require('express');

const {getFavorites, addFavorite, removeFavorite} = require('../controllers/favorites');

const router = express.Router();

const {protect}= require('../middleware/auth');

router.route('/').get(protect, getFavorites);
router.route('/:massageShopId').post(protect, addFavorite).delete(protect, removeFavorite);

module.exports=router;

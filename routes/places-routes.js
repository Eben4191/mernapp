const express = require('express');
const checkAuth = require('../middlewares/check-auth')
const {check} = require('express-validator');
const router = express.Router()
const fileUpload = require('../middlewares/file-upload')
const HttpError = require('../models/http-error');
const placesControllers = require('../controllers/places-controllers');
//get a place by a specific  place id
router.get('/:pid', placesControllers.getPlaceById);
//get the places created by a specific  user id
router.get('/user/:userid', placesControllers.getPlacesByUserId);
//adding places by specific user Id
router.use(checkAuth)
router.post('/',
    fileUpload.single('image'),
    [
     check('title')
     .not()
     .isEmpty(),
     check('description').isLength({min: 5}),
     check('address').not().isEmpty()
    ],
     placesControllers.createPlace);
router.patch('/:pid',
    [
    check('title')
    .not()
    .isEmpty(),
    check('description')
    .not()
    .isEmpty()
    
    ], 
    placesControllers.updatePlace);
router.delete('/:pid', placesControllers.deletePlace)


module.exports = router;
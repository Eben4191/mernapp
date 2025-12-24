const express = require('express');
const {check} = require('express-validator')
const fileUpload = require('../middlewares/file-upload')
const router = express.Router();
const usersController = require('../controllers/users-controllers');
router.get('/', usersController.getUsers)
router.post('/signup',
    fileUpload.single('image'), //this line of code enable multer to extract the image coming from the front end and send it to the multer file for processing before being store at the upload/image folder
    [
    check('email')
    .not()
    .isEmpty()
    .normalizeEmail()
    .isEmail(),
    check('password')
    .not()
    .isEmpty()
    .isLength({min:6}),
    check('firstname')
    .not()
    .isEmpty()
    .isLength({min:3}),
    check('lastname')
    .not()
    .isEmpty()
    .isLength({min:3})
    ],
     usersController.signup)
router.post('/verify-email', usersController.verifyEmail); // route to verify email 
router.post('/resend-verification', usersController.resendVerificationCode); // this route is to resend verification code
router.post('/login', usersController.login)


module.exports = router
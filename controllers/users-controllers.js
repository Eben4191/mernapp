const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error');
const User = require('../models/user');
const crypto = require('crypto');
const uploadToCloudinary = require('../util/cloudinary-upload');//importing the cloudinary upload function
const sendVerificationEmail = require('../util/send-email');
const getUsers = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;   // current page
  const limit = parseInt(req.query.limit) || 10; // users per page
  const skip = (page - 1) * limit;

  let users;
  let totalUsers;

  try {
    // Count only verified users
    totalUsers = await User.countDocuments({ isVerified: true });

    // Fetch only verified users
    users = await User.find({ isVerified: true }, "-password")
      .skip(skip)
      .limit(limit);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, cannot find users, please try again",
      500
    );
    return next(error);
  }

  // Send users with pagination info
  res.json({
    users: users.map(user => user.toObject({ getters: true })),
    totalUsers,
    currentPage: page,
    totalPages: Math.ceil(totalUsers / limit)
  });
};


const signup = async (req, res, next) => {
      console.log('SIGNUP HIT');
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs, please check your data', 422));
  }

  const { email, firstname, lastname, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError('Signup failed, please try again', 500));
  }

  if (existingUser) {
    return next(new HttpError('User with this email already exists', 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('Could not create user, please try again', 500));
  }

  // Generate verification code
  const verificationToken = crypto.randomBytes(3).toString('hex'); // 6 char hex code
  const verificationExpires = Date.now() + 3600000; // 1 hour from now

  let imageUrl = null;

if (req.file) {
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'mern-users');
    imageUrl = result.secure_url;
  } catch (err) {
    return next(new HttpError('Image upload failed', 500));
  }
}

  const createdUser = new User({
    email,
    firstname,
    lastname,
    image: imageUrl,
    password: hashedPassword,
    verificationToken,
     verificationExpires, // <-- store expiration
    places: []
  });

  try {
    await createdUser.save();
    await sendVerificationEmail(email, verificationToken); // send email
  } catch (err) {
    console.log(err);
    return next(new HttpError('Could not create user or send email', 500));
  }

  res.status(201).json({
    message: 'Signup successful! Check your email for verification code.',
    userId: createdUser.id
  });
};
const login = async (req, res, next)=>{
const { email, password} = req.body;
let existingUser;
try{
    existingUser = await User.findOne({ email: email});
} catch(err){
    const error = new HttpError('logging in failed please try again later',500)
    return next(error);
}

if(!existingUser){
    const error = new HttpError('Invalid credentials',401)
    return next(error)
}
let isValidPassword = false
try{
isValidPassword = await  bcrypt.compare(password, existingUser.password)
}catch(err){
    const error = new HttpError('invalid credentials',500)
    return next(error)
}
if(!isValidPassword){
    const error = new HttpError('invalid credentials',401)
    return next(error)
}
if (!existingUser.isVerified) {
  const error = new HttpError('Please verify your email before logging in', 401);
  return next(error);
}
let token;
try{
token =  jwt.sign(
    {userId: existingUser.id, email: existingUser.email}, 
    process.env.JWT_KEY,
     {expiresIn:'1h'}
    );
}catch(err){
    const error = new HttpError('Logging in failed please try again',500)
    return next(error)
}

 res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    userName: existingUser.firstname,
    token: token
  });
};

const verifyEmail = async (req, res, next) => {
  const { email, code } = req.body;
  console.log('VerifyEmail called with:', req.body);

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError('Something went wrong', 500));
  }

  if (!user) {
    return next(new HttpError('User not found', 404));
  }

  if (user.isVerified) {
    return next(new HttpError('User already verified', 400));
  }
   console.log("DB token:", user.verificationToken);
  console.log("Input code:", code);

  // ✅ Place the robust verification check here
  if (
    !user.verificationToken ||
    user.verificationToken.toLowerCase() !== code.trim().toLowerCase()
  ) {
    return next(new HttpError('Invalid verification code', 400));
  }

  if (user.verificationExpires < Date.now()) {
    return next(
      new HttpError('Verification code expired. Please request a new one.', 400)
    );
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully!' });
};


// controllers/users-controllers.js
const resendVerificationCode = async (req, res, next) => {
  const { email } = req.body;
  console.log("Resend code request for email:", email);

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    console.log("DB error:", err); // <-- log inside catch
    return next(new HttpError('Something went wrong', 500));
  }

  if (!user) {
    return next(new HttpError('User not found', 404));
  }

  if (user.isVerified) {
    return next(new HttpError('User already verified', 400));
  }

  // Generate new verification token and expiration
  const newToken = crypto.randomBytes(3).toString('hex'); // 6-char hex code
  const newExpiration = Date.now() + 3600000; // 1 hour

  user.verificationToken = newToken;
  user.verificationExpires = newExpiration;

  try {
    await user.save();
    await sendVerificationEmail(user.email, newToken); // Send new code
    console.log("Sent new verification email to:", user.email, "Code:", newToken);
  } catch (err) {
    console.log("Email send error:", err);
    return next(new HttpError('Could not send verification code', 500));
  }

  res.status(200).json({ message: 'New verification code sent to your email' });
};



exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.verifyEmail = verifyEmail;
exports.resendVerificationCode = resendVerificationCode;
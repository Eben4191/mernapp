const HttpError = require('../models/http-error')
const mongoose = require('mongoose');
const {validationResult} = require('express-validator');
const Place = require('../models/place')
const User = require('../models/user');
const uploadToCloudinary = require('../util/cloudinary-upload');



const getPlaceById = async ( req, res, next)=>{
    const placeId = req.params.pid;
    let place;
    try{
          place =  await Place.findById(placeId)
    }catch(err){
        const error = new HttpError('Something went wrong could not find a place.',500)
        return next(error);
    };
    if(!place){
        const error = new HttpError('could not find a place for the provided Id', 404)
        return next(error);
    }
   const placeObj = place.toObject({getters:true});
   if (placeObj.image && placeObj.image.startsWith('/')) {
     placeObj.image = `${req.protocol}://${req.get('host')}${placeObj.image}`;
   }
   res.json({place: placeObj});
};

const getPlacesByUserId = async (req,res,next)=>{
    const userId = req.params.userid
    let places;
    try{
         places =  await Place.find({creator:userId});
    }catch(err){
        console.log(err)
        const error = new HttpError('Something went wrong please try again.',500);
        return next(error);
    }
   if(!places || places.length ===0){
        const error = new HttpError('could not find a place for the provided user', 404)
        return next(error);
    }
res.json({places: places.map(place=>place.toObject({getters:true}))})
};

const createPlace = async (req, res, next)=>{
  const errors =  validationResult(req);
  if(!errors.isEmpty()){
    throw new HttpError('invalid inputs passed, please check your data.', 422);
  }
  let imageUrl = null;

if (req.file) {
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'mern-places');
    imageUrl = result.secure_url;
  } catch (err) {
    return next(new HttpError('Image upload failed', 500));
  }
}

const {title, description, address, location,} = req.body;
const createdPlace = new Place({
    title,
    description,
    address,
   location,
   image:  imageUrl,
   creator:  req.userData.userId
});

//to  check if the Id of the user that is trying to a create a place exist'
let user;
try{
    user = await User.findById( req.userData.userId)
} catch(err){
    const error = new HttpError('creating place failed please try agtin',500)
    return next(error)
}
if(!user){
    const  error = new HttpError('we could not find user',404)
    return next(error)
}
// Transactions and sessions allow us to check two independent operations to see if one of them fails if one of them do fail we stop the whole operation
//Below we are trying to check the saving of the created place in the database and the storing of the creator Id on the places data.
try{
//sess is the session that starts when we want to create a new place
const sess = await mongoose.startSession();
sess.startTransaction();
 await createdPlace.save({session:sess}) //creating place sess and transaction ends here.
//logic below  enables us to add the user Id to the created place
user.places.push(createdPlace);
await user.save({session:sess});
//now below we are commiting everything to the database
await sess.commitTransaction();
} catch(err){
    console.log(err)
const error = new HttpError('Creating place failed, pleace try agpin', 500);
return next(error);
}
  res.status(201).json({place:createdPlace});
}
const updatePlace = async (req, res, next)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        throw new HttpError('invalid inputs passed please check your data', 422);
    }
    const {title, description} = req.body
    const placeId = req.params.pid;
   let  place;
    try{
         place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong could not update place',500);
        return next(error);
    }
    //To check if the user that is trying to update the place is the creator of the place it's an authorization process
    if(place.creator.toString() !== req.userData.userId){
        const error  = new HttpError('You are not authorized for this task', 403);
        return next(error)
    }
    place.title = title;
    place.description=description;

    try{
       await place.save()
    } catch(err){
        const error = new HttpError('Something went wrong could not update place ',500)
        return next(error)
    }
    res.status(200).json({place:place.toObject({getters: true})})
}
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    return next(new HttpError('Something went wrong, could not delete place.', 500));
  }

  if (!place) {
    return next(new HttpError('Could not find place for this id.', 404));
  }

  // to check if the user that is trying to delete a place is the creator of the place it is an authorization mechanism
  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError('You are not allowed to delete this place.', 401));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError('Deleting place failed.', 500));
  }

  res.status(200).json({ message: 'Place deleted successfully.' });
};



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

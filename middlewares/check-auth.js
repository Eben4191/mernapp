const jwt = require('jsonwebtoken');
const  HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
if (req.method === 'OPTIONS') {
  return next();
}

    try{
         const token = req.headers.authorization.split(' ')[1]; //this line of code will recieve the token from the frontend
          if(!token){
            throw new Error('Authentication failed')
    } 
    const decodedToken = jwt.verify(token, process.env.JWT_KEY) //To verify the  token coming from the frontend to see if it match the one on the backend.
    req.userData = {userId: decodedToken.userId}; //extracting the userId from the decoded token for the purpose of digital signature.
    next();
    } catch(err){
         const error = new HttpError('Authentication failed!', 401)
        return next(error)
    }
   
}
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error')

const app = express();
//we added this body parser here as universal we can now use req.body anywhere in the rest folders
app.use(bodyParser.json());

//console.log('placesRoutes:', placesRoutes);
//console.log('usersRoutes:', usersRoutes);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or frontend URL
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // respond OK to preflight requests
  }

  next();
});

app.use('/uploads/images',express.static(path.join('uploads', 'images')))


app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);
app.use((req, res, next) => {
  next(new HttpError('Could not find this route.', 404));
});
//universal error handling
app.use((error, req, res, next)=>{
  if(req.file){
    fs.unlink(req.file.path, err => {}); //this line of code help us unlike the image anything there is an error instead of saving the image on the server
  }
if(res.headersSent){
    return next(error);
}
let statusCode;

switch (error.code) {
  case "LIMIT_FILE_SIZE":
    statusCode = 413; // Payload Too Large
    break;
  case "LIMIT_UNEXPECTED_FILE":
    statusCode = 400; // Bad Request
    break;
  default:
    statusCode = error.status || 500;
}

res.status(statusCode).json({ message: error.message || "An unknown error occurred" });
});
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ivvaluu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
.then(()=>{
app.listen(process.env.PORT ||
   5000)
})
.catch((error)=>{
    console.log(error)
})
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  process.on('unhandledRejection', err => {
    console.error('UNHANDLED PROMISE:', err);
    process.exit(1);
  });

  process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
  });
} else {
  process.on('unhandledRejection', err => {
    console.error('UNHANDLED PROMISE:', err);
  });

  process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION:', err);
  });
}


const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// Catch all unknown routes
app.use((req, res, next) => {
  next(new HttpError('Could not find this route.', 404));
});

// Universal error handler
app.use((error, req, res, next)=>{
  if (res.headersSent) return next(error);
  const statusCode = error.status || 500;
  res.status(statusCode).json({ message: error.message || "An unknown error occurred" });
});

// Connect to MongoDB & start server
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ivvaluu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
.then(() => {
  app.listen(process.env.PORT || 5000);
})
.catch(error => console.log(error));

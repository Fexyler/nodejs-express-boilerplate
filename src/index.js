const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const createError = require('http-errors');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const { NODE_ENV } = process.env;
const { verifyAccessToken } = require('./middlewares/verify_mw');
//with this line we can connect mongo.
require('./helpers/mongo_helper');
// and with help of this file we can connect to the our redis server
require('./helpers/redis_helper');

const app = express();

// for logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('tiny'));
}

// for secure HTTP headers
app.use(helmet());

// for being able to call req.body
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// sanitize request data 
app.use(xss());
app.use(mongoSanitize());

// for compressing requests
app.use(compression());

// enable cors for local development environment
app.use(cors());
app.options('*', cors());

// routes
const AuthRoute = require('./routes/auth.route');
const UserRoute = require('./routes/user.route');

app.use('/auth', AuthRoute);

app.use('/user', verifyAccessToken, UserRoute);

app.use((req, res, next) => {
  next(createError.NotFound());
});

// this thing is really weird because when I remove next from below responses will not be in json format.
app.use((err, req, res, _next) => {
  const errStatus = err.status || 500;
  res.status(errStatus);
  res.send({
    error: {
      status: errStatus,
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(`API listens requests on ${PORT} and this thing working on ${NODE_ENV} environment right now.`);
});
process.on('SIGINT', function () {
  console.log('\nShutting down the server (Ctrl-C)');
  process.exit(1);
});

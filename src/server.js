/******************************************************************
 * Server.js
 *
 * Description: Entry file to start express node server
 * Author: Jagadish Dharanikota
 *******************************************************************/

// Library imports

// import express from 'express';
// import bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import compression from 'compression';
// import helmet from 'helmet';

const os = require('os');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./shared/logger');
const requestLogger = require('./shared/request-logger');
const { CustomError, handleError } = require('./helpers/error');
const processHandler = require('./helpers/process-handler');
const routes = require('./routes');

const PORT = process.env.PORT || 8000;
const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(helmet());

//  apply to all requests
app.use(limiter);

/* To make cookie system work when deployed on reverse proxy like Nginx.
This make express trust cookies that are passed through a reverse proxy. */
app.set('trust proxy', 1);

// Middleware to enable CORS requests
app.use(cors());

/* // Replaced the custom code with cors package
// NEW - Add CORS headers - see https://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/

// Middleware to read cookies from the request header
app.use(cookieParser());

// Middleware to parse application/x-www-form-urlencoded & application/json data from the request
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

function shouldCompress(request, response) {
  if (request.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }
  // fallback to standard filter function
  return compression.filter(request, response);
}

app.use(compression({ filter: shouldCompress }));
app.use(requestLogger);

// Routing
app.use('/', routes());

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/server-info', (req, res) => {
  res.header({ 'Content-Type': 'text/html' }).send(
    `
<h4>Node server is running in ${process.env.NODE_ENV} mode on port ${PORT}.</h4>
<div>-----------------------------------------------------------------------</div>
<ul>
  <li>OS Platform   : ${os.type()} (${os.platform()})</li>
  <li>OS Version    : ${os.release()}</li>
  <li>CPU'S         : ${os.cpus().length}</li>
  <li>Architecture  : ${os.arch()}</li>
  <li>Total Memory  : ${os.totalmem()}</li>
  <li>Free Memory   : ${os.freemem()}</li>
</ul>
<div>-----------------------------------------------------------------------</div>
`
  );
});

// Middleware for error handling if none of the routes are met for the requested url
app.use((req, res, next) => {
  const error = new CustomError(404, `Route not found for the URL: ${req.url}`);
  return next(error);
});

// Middleware for error handling if any of the route logic throws error or exception
// Imp: This middleware should be last among all the middlewares
app.use((error, req, res, next) => {
  const { statusCode = 500, message = 'Internal server error' } = error;
  handleError({ statusCode, message }, res);
});

if (process.env.NODE_ENV !== 'test') {
  /* Wrapping listening on port in condition !test for unit testing. 
     See this link for more info - https://blog.campvanilla.com/jest-expressjs-and-the-eaddrinuse-error-bac39356c33a
  */
  app.listen(PORT, () => {
    logger.info(
      `Appinno is listening on port: ${PORT}. Service is accessible on http://localhost:${PORT}/`
    );

    // Reference: https://pm2.keymetrics.io/docs/usage/signals-clean-restart/
    // Here we send the ready signal to PM2. PM2 should be started with wait_ready: true option.
    // process.send will be available on in child process which is when server started pm2
    if (typeof process.send === 'function') {
      process.send('ready');
    }
  });
}

if (typeof processHandler === 'function') {
  processHandler();
}

app.on('error', (error) => {
  if (error) {
    logger.error(`Failed to start server on the port: ${PORT}. ${error.code} : ${error.message}`);
    logger.error(error.stack);
  }
});

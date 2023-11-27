// src/routes/index.js

const { hostname } = require('os');
const express = require('express');
const { authenticate } = require('../auth');
const { createSuccessResponse } = require('../response');
// version and author from package.json
const { version, author } = require('../../package.json');
// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 */
router.use(`/v1`, authenticate(), require('./api'));
// router.use(`/v1`, require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Use createSuccessResponse to format the response
  const responseData = createSuccessResponse({
    author,
    githubUrl: 'https://github.com/Rachit1313/fragments',
    version,
    hostname: hostname(),
  });
  // Send a 200 'OK' response with the formatted data
  res.status(200).json(responseData);
});

module.exports = router;

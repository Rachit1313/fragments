// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  const successData = createSuccessResponse({ fragments: [] });

  res.status(200).json(successData);
};

// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  if (req.query.expand === '1') {
    const fragmentData = await Fragment.byUser(req.user, true);
    const successData = createSuccessResponse({ fragments: fragmentData });
    res.status(200).json(successData);
  } else {
    const fragmentData = await Fragment.byUser(req.user);
    const successData = createSuccessResponse({ fragments: fragmentData });
    res.status(200).json(successData);
  }
};

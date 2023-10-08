const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');
const apiUrl = process.env.API_URL || 'http://localhost:8080';

module.exports = async (req, res) => {
  var owner = req.user;
  var type = req.get('content-Type');
  try {
    const fragment = new Fragment({ ownerId: owner, type: type });
    await fragment.save();
    await fragment.setData(req.body);

    logger.info(fragment);

    res.set('Location', `${apiUrl}/v1/fragments/${fragment.id}`);
    logger.info(`'Location', ${apiUrl}/v1/fragments/${fragment.id}`);

    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.warn(error.message, 'Error posting fragment');
    res.status(500).json(createErrorResponse(500, error.message));
  }
};

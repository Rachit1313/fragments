const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');
const apiUrl = process.env.API_URL || 'http://localhost:8080';

module.exports = async (req, res) => {
  var owner = req.user;
  logger.info('User details(owner id) :', owner);
  var type = req.get('content-Type');
  if (!Fragment.isSupportedType(type)) {
    logger.warn(type, 'is not supported');
    res.status(415).json(createErrorResponse(415, 'unsupported type'));
  }
  try {
    const fragment = new Fragment({
      ownerId: owner,
      type: type,
      size: Buffer.byteLength(req.body),
    });
    await fragment.save();
    await fragment.setData(req.body);

    logger.info(fragment);

    res.set('Location', `${apiUrl}/v1/fragments/${fragment.id}`);
    logger.info(`'Location', ${apiUrl}/v1/fragments/${fragment.id}`);

    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.warn(error.message, 'Error posting fragment');
  }
};

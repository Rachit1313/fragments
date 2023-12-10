const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const id = req.params.id.split('.')[0];
    const fragment = await Fragment.byId(req.user, id);
    const previousType = fragment.mimeType;
    logger.debug('fragment type : ' + fragment.type);

    const type = req.get('content-Type');
    if (!type.includes(previousType)) {
      logger.debug("type didn't match to update");
      res
        .status(400)
        .createErrorResponse(400, "A fragment's type can not be changed after it is created.");
    }

    logger.debug('set data started' + req.body);
    await fragment.setData(req.body);
    logger.debug('set data completed');
    res.status(200).json(createSuccessResponse({ fragment: fragment }));
  } catch (err) {
    res.status(404).json(createErrorResponse(404, `Unknown Fragment`));
  }
};

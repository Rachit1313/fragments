const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    logger.info('request inside get by ID route');
    const fragment = await Fragment.byId(req.user, req.params.id);
    const data = await fragment.getData();
    logger.info('retrieved fragment data');
    logger.info(fragment);
    if (!fragment) {
      res.status(204).json(createErrorResponse(404, 'No fragment found with this id'));
    }
    logger.debug('fragment type : ' + fragment.type);
    res.set('Content-Type', fragment.type);
    res.status(200).send(data);
  } catch (err) {
    res.status(404).json(createErrorResponse(404, `Unknown Fragment`));
  }
};

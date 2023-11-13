const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
module.exports = async (req, res) => {
  try {
    try {
      var fragment = await Fragment.byId(req.user, req.params.id);
    } catch (error) {
      res.status(404).json(createErrorResponse(404, 'Theres are no fragments with this id'));
      return;
    }
    logger.debug(fragment);
    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (err) {
    res.status(500).json(createErrorResponse(500, err.message));
  }
};

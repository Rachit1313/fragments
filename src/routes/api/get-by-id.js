const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  const fragment = await Fragment.byId(req.user, req.params.id);
  const data = await fragment.getData();
  if (!fragment) {
    res.status(204).json(createErrorResponse(404, 'No fragment found with this id'));
  }
  res.status(200).json(data.toString());
};

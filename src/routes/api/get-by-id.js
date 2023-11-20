const path = require('path');
const md = require('markdown-it')({
  html: true,
});
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const extension = path.extname(req.params.id);
    logger.debug('extension: ' + extension);

    const fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    const data = await fragment.getData();
    const previousType = fragment.mimeType;
    logger.debug('fragment type : ' + fragment.type);

    if ((fragment.type = 'text/markdown' && extension === '.html')) {
      logger.debug('converting from markdown to html: ');
      let converted = md.render(data.toString());
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(converted);
    } else {
      logger.debug('changing the type to ' + previousType);
      res.setHeader('Content-Type', previousType);
      res.status(200).send(data);
    }
  } catch (err) {
    res.status(404).json(createErrorResponse(404, `Unknown Fragment`));
  }
};

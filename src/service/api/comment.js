'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../const`);

const commentsRouter = new Router();

module.exports = (app, commentService) => {
  app.use(`/comments`, commentsRouter);

  commentsRouter.get(`/`, async (req, res) => {
    const comments = await commentService.findAll();
    if (!comments) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Comments not found!`);
    }
    return res.status(HttpCode.OK)
      .json(comments);
  });
};

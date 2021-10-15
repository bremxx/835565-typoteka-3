'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../const`);
const articleValidator = require(`../middlewares/article-validator`);
const articleExists = require(`../middlewares/article-exists`);
const commentValidator = require(`../middlewares/comment-validator`);
const routeParamsValidator = require(`../middlewares/route-params-validator`);

const articlesRouter = new Router();

module.exports = (app, articlesService, commentService) => {
  app.use(`/articles`, articlesRouter);
  const requestValidationMiddlewareSet = [routeParamsValidator, articleExists(articlesService)];


  articlesRouter.get(`/`, async (req, res) => {
    const {user, limit, offset, needComments} = req.query;
    let articles = {};

    if (user) {
      articles.current = await articlesService.findAll({needComments});
      return res.status(HttpCode.OK).json(articles);
    }

    if (offset) {
      articles.recent = await articlesService.findPage({limit, offset});
      return res.status(HttpCode.OK).json(articles);
    }

    articles.hot = await articlesService.findLimit({limit});

    return res.status(HttpCode.OK).json(articles);
  });


  // Current single article routes
  // to handle CRUD operations
  // -----------------------------
  articlesRouter.get(`/:articleId`, routeParamsValidator, async (req, res) => {
    const {articleId} = req.params;
    const {viewMode} = req.query;

    const article = await articlesService.findOne({articleId, viewMode});

    if (!article) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Unable to find article with id:${articleId}`);
    }

    return res.status(HttpCode.OK)
      .json(article);
  });

  articlesRouter.post(`/`, articleValidator, (req, res) => {
    const newArticle = articlesService.create(req.body);
    return res.status(HttpCode.CREATED)
      .json(newArticle);
  });

  articlesRouter.put(`/:articleId`, [articleValidator, ...requestValidationMiddlewareSet], async (req, res) => {
    const {articleId} = req.params;

    const updatedArticle = await articlesService.update({id: articleId, update: req.body});

    if (!updatedArticle) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Unable to find article with id:${articleId}`);
    }

    return res.status(HttpCode.OK)
      .send(`Updated`);
  });

  articlesRouter.delete(`/:articleId`, [...requestValidationMiddlewareSet], (req, res) => {
    const {articleId} = req.params;
    const deletedArticle = articlesService.delete(articleId);
    if (!deletedArticle) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Unable to delete unexisting article!`);
    }
    return res.status(HttpCode.OK)
      .json(deletedArticle);
  });


  // Current article's comments routes
  // to handle CRUD operations
  // ---------------------------------
  articlesRouter.get(`/:articleId/comments`, [...requestValidationMiddlewareSet], async (req, res) => {
    const {articleId} = req.params;

    const comments = await commentService.findAll({id: articleId});

    return res.status(HttpCode.OK)
      .json(comments);
  });

  articlesRouter.post(`/:articleId/comments`, [commentValidator, ...requestValidationMiddlewareSet], async (req, res) => {
    const {articleId} = req.params;

    const newComment = await commentService.create(articleId, req.body);

    return res.status(HttpCode.CREATED)
      .json(newComment);
  });

  articlesRouter.delete(`/:articleId/comments/:commentId`, [...requestValidationMiddlewareSet], async (req, res) => {
    const {articleId, commentId} = req.params;

    const currentComment = await commentService.findOne(articleId, commentId);

    if (!currentComment) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Cannot delete unexisting comment`);
    }

    const deletedComment = await commentService.drop(articleId, commentId);

    return res.status(HttpCode.OK)
      .json(deletedComment);
  });
};

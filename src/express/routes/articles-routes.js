'use strict';

const {Router} = require(`express`);

const upload = require(`../middlewares/upload`);
const checkAuth = require(`../middlewares/auth`);
const {getLogger} = require(`../../service/lib/logger`);
const {humanizeDate, prepareErrors} = require(`../../utils/utils-common`);
const {
  HumanizedDateFormat,
  HttpCode,
  TemplateName
} = require(`../../const`);

const api = require(`../api`).getAPI();
const articlesRouter = new Router();
const logger = getLogger({name: `article-routes api`});

const utils = {
  humanizeDate,
  HumanizedDateFormat,
};


/**
 * EXPRESS ROUTES
 *
 * Adding single article
 */
articlesRouter.get(`/add`, checkAuth, async (req, res) => {
  const {user} = req.session;

  try {
    const categories = await api.getCategories({needCount: false});
    res.render(`post-new`, {categories, user, ...utils});
  } catch (error) {
    logger.error(`Error on 'articles/add' route: ${error.message}`);
    res.render(`errors/500`);
  }
});

articlesRouter.post(`/add`, upload(logger, TemplateName.POST_EDIT), async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;

  const newArticle = {
    title: body.title,
    picture: file?.filename || ``,
    announce: body.announcement,
    fullText: body[`full-text`],
    createdAt: humanizeDate(``, body[`date`]),
    categories: body.categories
  };

  // ! обработать ошибку 500
  try {
    await api.createArticle(newArticle);
    res.redirect(`/my`);
  } catch (errors) {
    const categories = await api.getCategories({needCount: false})
      .catch(() => res.render(`errors/500`));
    const validationMessages = prepareErrors(errors);

    res.render(`post-edit`, {validationMessages, user, categories, article: newArticle, ...utils});
  }
});


/**
 * Editing single article
 */
articlesRouter.get(`/edit/:id`, checkAuth, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    const [article, categories] = await Promise.all([
      api.getArticle({id, viewMode: false}),
      api.getCategories({needCount: false}),
    ]);
    res.render(`post-edit`, {categories, article, user, id, ...utils});
  } catch (error) {
    logger.error(`Error on 'articles/edit/${id}' route: ${error.message}`);
    res.render(`errors/404`);
  }
});

articlesRouter.post(`/edit/:id`, upload(logger, TemplateName.POST_EDIT), async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  const {body, file} = req;
  const articleData = {
    title: body.title,
    picture: file?.filename || ``,
    announce: body.announcement,
    fullText: body[`full-text`],
    createdAt: humanizeDate(``, body[`date`]),
    categories: body.categories
  };

  // ! обработать ошибку 500
  try {
    await api.editArticle({id, data: articleData});
    res.redirect(`/my`);
  } catch (errors) {
    const categories = await api.getCategories({needCount: false})
      .catch(() => res.render(`errors/500`));
    const validationMessages = prepareErrors(errors);

    res.render(`post-edit`, {validationMessages, user, categories, article: articleData, id, ...utils});
  }
});


/**
 * Viewing single article
 */
articlesRouter.get(`/:id`, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    const article = await api.getArticle({id, viewMode: true});
    res.render(`post`, {article, id, user, ...utils});
  } catch (error) {
    logger.error(`Error on 'articles/${id}' route: ${error.message}`);
    res.render(`errors/404`);
  }
});


/**
 * Deleting single article
 */
articlesRouter.delete(`/:id`, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    const article = await api.deleteArticle({id, userId: user.id});
    res.status(HttpCode.OK).send(article);
  } catch (error) {
    res.status(error.response.status).send(error.response.statusText);
  }
});


/**
 * Adding/deleting comments
 * of a single article
 */
articlesRouter.post(`/:id/comments`, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const {message} = req.body;

  const commentData = {
    userId: user.id,
    text: message
  };

  try {
    try {
      await api.createComment({id, data: commentData});
      res.redirect(`/articles/${id}`);
    } catch (errors) {
      const article = await api.getArticle({id, viewMode: true});
      const validationMessages = prepareErrors(errors);
      res.render(`post`, {validationMessages, article, id, user, ...utils});
    }
  } catch (error) {
    logger.error(`An error occurred while creating new comment at article #${id}: ${error.message}`);
    res.render(`errors/500`);
  }
});

articlesRouter.get(`/category/:id`, (req, res) => res.render(`posts-by-category`));

module.exports = articlesRouter;

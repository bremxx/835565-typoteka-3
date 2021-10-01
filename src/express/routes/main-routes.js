'use strict';

const {Router} = require(`express`);
const {humanizeDate} = require(`../../utils/utils-common`);
const {
  HumanizedDateFormat,
  LAST_COMMENTS_MAX_NUM,
  HOT_ARTICLES_LIMIT,
  ARTICLES_PER_PAGE,
  PAGINATION_WIDTH
} = require(`../../const`);
const api = require(`../api`).getAPI();
const {getLogger} = require(`../../service/lib/logger`);

const mainRouter = new Router();
const logger = getLogger({name: `main-routes api`});

const utils = {
  humanizeDate,
  HumanizedDateFormat,
  PAGINATION_WIDTH,
};


mainRouter.get(`/`, async (req, res) => {
  let {page = 1} = req.query;
  const offset = (page - 1) * ARTICLES_PER_PAGE;

  try {
    const [
      {hot: hotArticles},
      {recent: {count, articles: previewArticles}},
      categories,
      comments
    ] = await Promise.all([
      await api.getArticles({limit: HOT_ARTICLES_LIMIT}),
      await api.getArticles({limit: ARTICLES_PER_PAGE, offset}),
      await api.getCategories(true),
      await api.getComments(LAST_COMMENTS_MAX_NUM)
    ]);

    const totalPages = Math.ceil(count / ARTICLES_PER_PAGE);

    const options = {
      hotArticles,
      previewArticles,
      comments,
      categories,
      page: +page,
      totalPages,
      ...utils
    };

    res.render(`main`, {...options});
  } catch (error) {
    logger.error(`Internal server error: ${error.message}`);
    res.render(`errors/500`);
  }
});

mainRouter.get(`/register`, (req, res) => res.render(`registration`));

mainRouter.get(`/login`, (req, res) => res.render(`login`));

mainRouter.get(`/search`, async (req, res) => {
  const {search} = req.query;
  try {
    if (search) {
      const options = {
        search,
        results: await api.search(search),
        ...utils,
      };
      res.render(`search`, {...options});
    } else {
      res.render(`search`);
    }
  } catch (error) {
    try {
      res.render(`search-empty`, {search});
    } catch (err) {
      logger.error(`Internal server error: ${err.message}`);
      res.render(`errors/500`);
    }
  }
});

mainRouter.get(`/categories`, async (req, res) => {
  try {
    const categories = await api.getCategories();
    res.render(`categories`, {categories});
  } catch (error) {
    logger.error(`Internal server error: ${error.message}`);
    res.render(`errors/500`);
  }
});

module.exports = mainRouter;

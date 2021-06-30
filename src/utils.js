'use strict';

const {nanoid} = require(`nanoid`);
const dayjs = require(`dayjs`);

const {
  MAX_ID_LENGTH,
  DaysGap,
  CommentsNum,
  CommentsSentencesNum,
  SentencesNum,
  CategoriesNum,
  HOT_ARTICLES_MAX_NUM,
  LAST_COMMENTS_MAX_NUM,
  PREVIEW_ARTICLES_MAX_NUM,
} = require(`./const`);

const getRandomNum = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffle = (someArray) => {
  for (let i = someArray.length - 1; i > 0; i--) {
    const randomPosition = Math.floor(Math.random() * i);
    [someArray[i], someArray[randomPosition]] = [someArray[randomPosition], someArray[i]];
  }
  return someArray;
};

const getRandomDate = () => {
  const randomDaysGap = getRandomNum(DaysGap.MIN, DaysGap.MAX);
  return dayjs().add(-randomDaysGap, `day`).format();
};

const generateComments = (count, comments) => {
  return Array(count).fill({}).map(() => ({
    id: nanoid(MAX_ID_LENGTH),
    text: shuffle(comments).slice(0, getRandomNum(CommentsSentencesNum.MIN, CommentsSentencesNum.MAX)).join(` `),
    date: getRandomDate(),
  }));
};

const generateMockData = (count, {titles, descriptions, categories, comments}) => {
  return Array(count).fill({}).map(() => ({
    id: nanoid(MAX_ID_LENGTH),
    title: titles[getRandomNum(0, titles.length - 1)],
    createdDate: getRandomDate(),
    announce: shuffle(descriptions).slice(0, getRandomNum(SentencesNum.MIN, SentencesNum.MAX)).join(` `),
    fullText: shuffle(descriptions).slice(0, getRandomNum(SentencesNum.MIN, descriptions.length - 1)).join(` `),
    сategories: shuffle(categories).slice(0, getRandomNum(CategoriesNum.MIN, CategoriesNum.MAX)),
    comments: generateComments(getRandomNum(CommentsNum.MIN, CommentsNum.MAX), comments),
  }));
};

const getCategories = (items) => {
  const сategories = items.reduce((acc, currentItem) => {
    currentItem.сategories.forEach((categoryItem) => acc.add(categoryItem));
    return acc;
  }, new Set());

  return [...сategories];
};

const getHotArticles = (articles) => {
  return articles.slice()
    .sort((left, right) => right.comments.length - left.comments.length)
    .slice(0, HOT_ARTICLES_MAX_NUM);
};

const getPreviewArticles = (articles) => {
  return articles.slice()
    .sort((left, right) => right.createdDate - left.createdDate)
    .slice(0, PREVIEW_ARTICLES_MAX_NUM);
};

const getLastComments = (articles) => {
  return articles.reduce((acc, currentArticle) => {
    currentArticle.comments.forEach((comment) => acc.push(comment));
    return acc
      .sort((left, right) => right.date - left.date)
      .slice(0, LAST_COMMENTS_MAX_NUM);
  }, []);
};

const humanizeDate = (format, date) => {
  return dayjs(date).format(format);
};

const adaptArticleToClient = (article) => {
  const adaptedArticle = Object.assign(
      {},
      article,
      {"humanizedDate": humanizeDate(`DD.MM.YYYY, HH:mm`, article.createdDate)}
  );
  return adaptedArticle;
};

module.exports = {
  getRandomNum,
  shuffle,
  getRandomDate,
  generateMockData,
  getCategories,
  getHotArticles,
  getPreviewArticles,
  getLastComments,
  adaptArticleToClient,
};


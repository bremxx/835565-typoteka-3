'use strict';

const chalk = require(`chalk`);
const fs = require(`fs`).promises;
const path = require(`path`);
const dayjs = require(`dayjs`);

const {DaysGap, HoursGap} = require(`../const`);

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
  const randomHoursGap = getRandomNum(HoursGap.MIN, HoursGap.MAX);
  return dayjs().add(-randomDaysGap, `day`).add(-randomHoursGap, `hour`).format();
};

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content.trim().split(`\n`);
  } catch (error) {
    console.error(chalk.red(error));
    return [];
  }
};

const humanizeDate = (format, date) => {
  return dayjs(date).format(format);
};

const validationErrorHandler = (error) => error.response?.data.split(`\n`) || [error];

const getRandomMockArticleId = (mockArticles) => getRandomNum(1, mockArticles.length);

const adaptArticleToClient = (article) => (
  {
    ...article,
    categories: article.categories?.map((category) => ({id: +category}))
  }
);

const createDirs = async (dirpaths) => {
  console.info(chalk.green(`Creating folders...`));
  for (const dirpath of dirpaths) {
    console.info(chalk.green(`Creating folder: ${dirpath}`));
    await fs.mkdir(path.resolve(process.cwd(), dirpath), {
      recursive: true,
    });
  }
  console.info(chalk.green(`Finished. \n`));
};

const copyFiles = async (sourceDir, targetDir) => {
  const files = await fs.readdir(sourceDir);
  console.info(chalk.green(`Copying mock images...`));

  for (const file of files) {
    console.info(chalk.green(`Copying file: ${file}`));
    await fs.copyFile(path.join(sourceDir, file), path.join(targetDir, file));
  }
  console.info(chalk.green(`Finished. \n`));
};

module.exports = {
  getRandomNum,
  shuffle,
  getRandomDate,
  readContent,
  humanizeDate,
  validationErrorHandler,
  getRandomMockArticleId,
  adaptArticleToClient,
  createDirs,
  copyFiles,
};


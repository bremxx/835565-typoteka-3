'use strict';

const Aliase = require(`../models/aliase`);
const {ORDER_BY_LATEST_DATE} = require(`../../const`);

class CategoryService {
  constructor(sequelize) {
    this._sequelize = sequelize;
    this._Category = sequelize.models.Category;
    this._ArticleCategory = sequelize.models.ArticleCategory;
  }

  async create(data) {
    const category = await this._Category.create(data);
    return category.get();
  }

  async update({id, update}) {
    const affectedRow = await this._Category.update(update, {
      where: {id}
    });

    return !!affectedRow;
  }

  async drop({id}) {
    const deletedRow = await this._Category.destroy({
      where: {id}
    });

    return !!deletedRow;
  }

  async findOne(id) {
    return this._Category.findByPk(id);
  }

  async findAll({needCount}) {
    if (needCount) {
      const result = await this._Category.findAll({
        attributes: [
          `id`,
          `name`,
          [this._sequelize.fn(`COUNT`, `*`), `count`]
        ],
        group: [this._sequelize.col(`Category.id`)],
        include: [{
          model: this._ArticleCategory,
          as: Aliase.ARTICLE_CATEGORIES,
          attributes: [],
          required: true
        }],

      });
      return result.map((item) => item.get());
    } else {
      return this._Category.findAll({
        raw: true,
        order: [ORDER_BY_LATEST_DATE]
      });
    }
  }
}

module.exports = CategoryService;

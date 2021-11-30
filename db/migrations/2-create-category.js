'use strict';

const {Aliase} = require(`../../src/const`);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(Aliase.CATEGORIES, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, _Sequelize) => {
    await queryInterface.dropTable(Aliase.CATEGORIES);
  }
};

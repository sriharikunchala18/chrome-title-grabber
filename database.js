const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "linkedin.sqlite"
});

module.exports = sequelize;

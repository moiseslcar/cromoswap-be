const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TemplateSticker = sequelize.define('TemplateSticker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  albumTemplateId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'TemplateStickers',
  timestamps: true
});

module.exports = TemplateSticker;

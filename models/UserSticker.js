const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSticker = sequelize.define('UserSticker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  userAlbumId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  templateStickerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'UserStickers',
  timestamps: true
});

module.exports = UserSticker;

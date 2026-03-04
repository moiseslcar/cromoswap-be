const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAlbum = sequelize.define('UserAlbum', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  albumTemplateId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'UserAlbums',
  timestamps: true
});

module.exports = UserAlbum;

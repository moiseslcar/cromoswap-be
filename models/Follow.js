const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Follows',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId']
    }
  ]
});

module.exports = Follow;

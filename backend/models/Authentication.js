const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee'); // Import Employee model

const Authentication = sequelize.define('Authentication', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employee,
      key: 'EmployeeID',
    },
  },
}, {
  tableName: 'authentications',
  timestamps: false, // Set to true if you want createdAt/updatedAt columns
});

module.exports = Authentication;


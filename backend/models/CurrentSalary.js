// models/CurrentSalary.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CurrentSalary extends Model {}

CurrentSalary.init({
  EmployeeID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Employee',
      key: 'EmployeeID'
    }
  },
  SalaryID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Salary',
      key: 'SalaryID'
    }
  }
}, {
  sequelize,
  modelName: 'CurrentSalary'
});

module.exports = CurrentSalary;
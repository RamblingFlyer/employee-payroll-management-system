const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee');

const Salary = sequelize.define(
  'Salary',
  {
    SalaryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    EmployeeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Employee,
        key: 'EmployeeID',
      },
    },
    BasicPay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    Allowances: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    Deductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    Bonuses: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    NetSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      // Removing default value; should be calculated dynamically before insert
    },
    Date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Automatically set to the current date/time
    },
  },
  {
    tableName: 'Salary',
    timestamps: false, // Assuming there are no auto-created createdAt/updatedAt columns
  }
);

// Define associations
Employee.hasMany(Salary, { foreignKey: 'EmployeeID' });
Salary.belongsTo(Employee, { foreignKey: 'EmployeeID' });

module.exports = Salary;

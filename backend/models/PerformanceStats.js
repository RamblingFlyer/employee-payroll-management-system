// models/PerformanceStats.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employee = require('./Employee'); // Import Employee model for relationships

const PerformanceStats = sequelize.define('PerformanceStats', {
    EvaluationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    EmployeeID: {
        type: DataTypes.INTEGER,
        references: {
            model: Employee,  // Foreign key reference to the Employee model
            key: 'EmployeeID'
        }
    },
    Grade: {
        type: DataTypes.STRING(5)
    },
    EvaluationDate: {
        type: DataTypes.DATE
    },
    Comments: {
        type: DataTypes.TEXT
    },
    EvaluatorID: {
        type: DataTypes.INTEGER,
        references: {
            model: Employee,  // Evaluator is also an Employee
            key: 'EmployeeID'
        }
    }
}, {
    tableName: 'PerformanceStats',
    timestamps: false  // Assuming no timestamps for the PerformanceStats table
});

PerformanceStats.belongsTo(Employee, { foreignKey: 'EmployeeID' });  // Employee being evaluated
PerformanceStats.belongsTo(Employee, { foreignKey: 'EvaluatorID', as: 'Evaluator' });  // Evaluator


module.exports = PerformanceStats;

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  EmployeeID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,  // Ensures EmployeeID is not null
  },
  Name: {
    type: DataTypes.STRING(100),  // Adjusted length to varchar(100)
    allowNull: false,             // Name is mandatory
  },
  Department: {
    type: DataTypes.STRING(50),  // Adjusted length to varchar(50)
    allowNull: true,
  },
  ContactNo: {
    type: DataTypes.STRING(15),  // Adjusted length to varchar(15)
    allowNull: true,
  },
  Address: {
    type: DataTypes.TEXT,  // No change needed as it's already 'text'
    allowNull: true,
  },
  Email: {
    type: DataTypes.STRING(100),  // Adjusted length to varchar(100)
    allowNull: true,               // Allow NULL as per the table definition
    validate: {
      isEmail: true,
    },
  },
  RoleID: {
    type: DataTypes.INTEGER,  // Foreign key column for RoleID
    allowNull: true,
    references: {
      model: 'userrole',  // The table name where RoleID is stored
      key: 'RoleID',      // The primary key of the 'userrole' table
    },
    onDelete: 'SET NULL',  // Optional: defines what happens when a referenced role is deleted
    onUpdate: 'CASCADE',   // Optional: if RoleID in userrole is updated, it will cascade
  },
  DateOfJoining: {
    type: DataTypes.DATEONLY,  // Use DATEONLY for a date without time (matching 'date' type)
    allowNull: true,           // Allow NULL as per the table definition
  },
}, {
  tableName: 'Employee',  // This will define the table name in MySQL
  timestamps: false,      // Timestamps not needed as they were not included in your schema
});

// Association to the userrole table (optional if you need to query the Role data)
Employee.associate = (models) => {
  Employee.belongsTo(models.UserRole, {
    foreignKey: 'RoleID',
    as: 'role',  // Alias to access the associated Role data
  });
};

module.exports = Employee;

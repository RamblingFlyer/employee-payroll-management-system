const {Sequelize} = require('sequelize')
const sequelize = new Sequelize('EmployeeManagement', 'john', 'T3!p@xW9Q#zK8&vM', {
    host: 'localhost',
    dialect: 'mysql',
});
module.exports = sequelize;
  
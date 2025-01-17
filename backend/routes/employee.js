const express = require('express');
const router = express.Router();
const EmpController = require('../controllers/employeeController');

//evaluations
router.get('/mydetails', EmpController.getEmployeeById);
//router.get('/myperformance', EmpController.getPerformanceStats);

//getall,get single, post salary records
router.get('/mypayrollhistory', EmpController.getSalaryRecords);
router.get('/mysalary', EmpController.getEmployeeSalary);

//getdetails
router.get('/mystats',EmpController.getEmployeeDetails);
module.exports = router;
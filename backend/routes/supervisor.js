const express = require('express');
const router = express.Router();
const supcontroller = require('../controllers/supervisorController');
const EmpController = require('../controllers/employeeController');
//employee
router.get('/mysubs', supcontroller.getmyemployeedetails); //WORK

//evaluations
router.get('/byId/:id', supcontroller.getEmployeeById); //WORK
router.get('/performance/:employeeId', supcontroller.getPerformanceStats); //WORK
router.get('/evalbyme',supcontroller.getEvaluationsByEvaluator)//WORK
router.post('/addeval', supcontroller.addEvaluation);//WORK
//getall,get single, post salary records
router.get('/payrollhist/:employeeID', supcontroller.getSalaryRecords); //WORK
router.get('/salary/:employeeID', supcontroller.getEmployeeSalary);//WORK

//getdetails
router.get('/stats/:employeeID',supcontroller.getEmployeeDetails);//WORK

//supervisor's user details

//evaluations
router.get('/mydetails', EmpController.getEmployeeById);
//router.get('/myperformance', EmpController.getPerformanceStats);

//getall,get single, post salary records
router.get('/mypayrollhistory', EmpController.getSalaryRecords);
router.get('/mysalary', EmpController.getEmployeeSalary);

//getdetails
router.get('/mystats',EmpController.getEmployeeDetails);
module.exports = router;
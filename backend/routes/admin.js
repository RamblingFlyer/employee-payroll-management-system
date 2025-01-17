const express = require('express');
const router = express.Router();
const AdController = require('../controllers/AdController');
const EmpController = require('../controllers/employeeController');
// Route to insert a new user
router.post('/create-user', AdController.insertcreds); //work

module.exports = router;
//employee
router.post('/add',AdController.addEmployee); //works
router.get('/', AdController.getAllEmployees); //works

//evaluations
router.get('/:id', AdController.getEmployeeById);//works
router.get('/performance/:employeeID', AdController.getPerformanceStats);//works
router.get('/evaluations/:evaluatorID',AdController.getEvaluationsByEvaluator)//works
router.post('/evaluations/:evaluatorID', AdController.addEvaluation); //works

//getall,get single, post salary records
router.get('/payrollhis/:employeeID', AdController.getSalaryRecords);//works
router.post('/salary', AdController.addSalary);//works
router.get('/salary/:employeeID', AdController.getEmployeeSalary);//works

//getdetails
router.get('/stats/:employeeID',AdController.getEmployeeDetails);//works


//ADMIN DETAILS
router.get('/mydetails', EmpController.getEmployeeById);
router.get('/myperformance', EmpController.getPerformanceStats);

//getall,get single, post salary records
router.get('/mypayrollhistory', EmpController.getSalaryRecords);
router.get('/mysalary', EmpController.getEmployeeSalary);

//getdetails
router.get('/mystats',EmpController.getEmployeeDetails);
module.exports = router;
const express = require('express');
const router = express.Router();
const EmpController = require('../controllers/empController');

//employee
router.post('/add',EmpController.addEmployee);
router.get('/', EmpController.getAllEmployees);

//evaluations
router.get('/:id', EmpController.getEmployeeById);
router.get('/:employeeId/performance', EmpController.getPerformanceStats);
router.get('/:evaluatorId/evaluations',EmpController.getEvaluationsByEvaluator)
router.post('/:evaluatorId/evaluations', EmpController.addEvaluation);

//getall,get single, post salary records
router.get('/:employeeID/salary', EmpController.getSalaryRecords);
router.post('/:employeeID/salary', EmpController.addSalary);
router.get('/salary/:employeeID', EmpController.getEmployeeSalary);

//getdetails
router.get('/:employeeID/stats',EmpController.getEmployeeDetails);
module.exports = router;
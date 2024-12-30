const express = require('express');
const router = express.Router();
const EmpController = require('../controllers/empController');

router.post('/add',EmpController.addEmployee);

module.exports = router;
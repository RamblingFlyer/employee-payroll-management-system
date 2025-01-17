const Employee = require('../models/Employee');
const PerformanceStats = require('../models/PerformanceStats');
const CurrentSalaries = require('../models/CurrentSalary')
const Salary = require('../models/Salary')
const bcrypt = require('bcrypt');
const Authentication = require('../models/Authentication');
// controllers/empController.js
// Insert User Function
const jwt = require('jsonwebtoken');
// Secret key for signing the JWT (store securely, e.g., in environment variables)

exports.getEmployeeDetails = async (req, res) => {
  const { employeeId } = req.user;  // Extract employeeId from request params
    try {
        // Fetch performance stats for the employee
        const performanceStats = await PerformanceStats.findAll({
            where: {
                EmployeeID: employeeId  // Fetch records for the given EmployeeID
            },
            include: [
                {
                    model: Employee,
                    as: 'Employee',  // Alias for the employee being evaluated
                    attributes: ['EmployeeID', 'Name']  // Only include relevant attributes for the employee
                },
                {
                    model: Employee,
                    as: 'Evaluator',  // Alias for the evaluator (the one who evaluated the employee)
                    attributes: ['EmployeeID', 'Name']  // Only include relevant attributes for the evaluator
                }
            ]
        });

        // If no performance stats are found, return a 404 error
        if (performanceStats.length === 0) {
            return res.status(404).json({ message: 'Performance stats not found for this employee' });
        }

        // Fetch all salary records associated with the employee
        const salaryRecords = await Salary.findAll({
            where: { EmployeeID: employeeId }
        });

        // Return the performance stats and salary records
        return res.status(200).json({
            performanceStats,
            salaryRecords
        });

    } catch (err) {
        console.error('Error retrieving employee details:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
    }
};


exports.getEmployeeSalary = async (req, res) => {
  const { employeeId } = req.user; // Correctly destructuring employeeId

  try {
    // Ensure employeeId is provided
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required.' });
    }

    console.log('Employee ID:', employeeId);

    // Find the current salary record for the employee
    const currentSalary = await CurrentSalaries.findOne({ where: { EmployeeID: employeeId } });

    if (!currentSalary) {
      console.log('No current salary record found for employee ID:', employeeId);
      return res.status(404).json({ message: 'No salary record found for this employee.' });
    }

    // Safely access SalaryID
    const salaryID = currentSalary?.SalaryID;
    console.log('Retrieved salaryID:', salaryID);

    if (!salaryID) {
      return res.status(404).json({ message: 'Salary ID is missing for this employee.' });
    }

    // Return only the salaryID associated with the employee
    res.status(200).json(currentSalary);

  } catch (error) {
    console.error('Error fetching employee salary:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


  

  
exports.getSalaryRecords = async (req, res) => {
  const { employeeId } = req.user;
    
    try {
      const salaryRecords = await Salary.findAll({
        where: { EmployeeID: employeeId },
      });
      
      if (salaryRecords.length === 0) {
        return res.status(404).json({ message: 'No salary records found for this employee.' });
      }
      
      return res.status(200).json(salaryRecords);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  

exports.getPerformanceStats = async (req, res) => {
  const { employeeId } = req.user;  

    try {
        // Fetch performance stats for the given EmployeeID
        const performanceStats = await PerformanceStats.findAll({
            where: {
                EmployeeID: employeeId  // Find records for the given EmployeeID
            },
            include: [
                {
                    model: Employee,  // Get the employee info (the one being evaluated)
                    as: 'Employee',  // Alias for the Employee model (can be named anything)
                    attributes: ['EmployeeID', 'Name']  // Attributes to return for the evaluated employee
                },
                {
                    model: Employee,  // Get the evaluator's info (the one who did the evaluation)
                    as: 'Evaluator',  // Alias for the evaluator (must match the alias in the model association)
                    attributes: ['EmployeeID', 'Name']  // Attributes to return for the evaluator
                }
            ]
        });

        // If no performance stats found, return a 404 error
        if (performanceStats.length === 0) {
            return res.status(404).json({ message: 'Performance stats not found for this employee' });
        }

        // Return the performance stats including the evaluator information
        return res.status(200).json(performanceStats);
    } catch (err) {
        console.error('Error retrieving performance stats:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
    }
};
  
  // Get an employee by ID
  exports.getEmployeeById = async (req, res) => {
    try {
      const { employeeId } = req.user;  // Directly use req.user.employeeId
  
      const employee = await Employee.findByPk(employeeId);  // Use employeeId here
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found', employeeID: employeeId });
      }
      res.status(200).json(employee);
    } catch (error) {
      console.error('Error fetching employee by ID:', error.message); 
      res.status(500).json({ error: 'Failed to fetch employee' });
    }
  };
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

exports.addEvaluation = async (req, res) => {
    const { employeeID, grade, evaluationDate, comments } = req.body;
    const { employeeId } = req.user;  // The evaluator submitting the evaluation

    // Validate the required fields
    if (!employeeID || !grade || !evaluationDate || !employeeId) {
        return res.status(400).json({ error: 'Missing required fields. Please provide employeeId, grade, evaluationDate, and evaluatorId.' });
    }

    try {
        const employee = await Employee.findOne({
            where: { EmployeeID: employeeID, SupervisorID: employeeId }, // Match employeeId and SupervisorID
            attributes: ['EmployeeID', 'Name', 'SupervisorID']
        });

        // If no such employee exists, deny access
        if (!employee) {
            return res.status(403).json({
                error: 'You are not authorized to evaluate this employee. Only supervisors can evaluate their employees.'
            });
        }
        // Create a new evaluation record in the PerformanceStats table
        const newEvaluation = await PerformanceStats.create({
            EmployeeID: employeeId,
            Grade: grade,
            EvaluationDate: evaluationDate,
            Comments: comments,
            EvaluatorID: employeeId
        });

        // Return the newly created evaluation as a response
        return res.status(201).json({
            message: 'Evaluation added successfully',
            evaluation: newEvaluation
        });
    } catch (err) {
        console.error('Error adding evaluation:', err.message);

        // Check if the error is a Sequelize ValidationError for more specific feedback
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error', details: err.errors });
        }

        // Return a general database error message
        return res.status(500).json({ error: 'Database error', details: err.message });
    }
};
exports.getEvaluationsByEvaluator = async (req, res) => {
    const { employeeId } = req.user;

    try {
        // Fetch all performance stats where the evaluator is the given EvaluatorID
        const evaluations = await PerformanceStats.findAll({
            where: {
                EvaluatorID: employeeId  // Find records where EvaluatorID matches the given evaluator
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

        // If no evaluations found, return a 404 error
        if (evaluations.length === 0) {
            return res.status(404).json({ message: 'No evaluations found for this evaluator' });
        }

        // Return the evaluations done by the evaluator
        return res.status(200).json(evaluations);
    } catch (err) {
        console.error('Error retrieving evaluations:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
    }
};
exports.getmyemployeedetails = async (req, res) => {
    const { employeeId }= req.user;  // Extract employeeId from request params
    try {
        // Fetch all employees who report to the supervisor (SupervisorID matches the given ID)
        const employees = await Employee.findAll({
            where: { SupervisorID: employeeId },  // Fetch records for employees under the supervisor
            attributes: ['EmployeeID', 'Name', 'Department'], // Include relevant employee details
        });

        // If no employees are found, return a 404 error
        if (employees.length === 0) {
            return res.status(404).json({ message: 'No employees found under this supervisor' });
        }

        // Initialize an array to hold performance stats and salary records for each employee
        const employeeDetailsPromises = employees.map(async (employee) => {
            // Fetch performance stats for the current employee
            const performanceStats = await PerformanceStats.findAll({
                where: { EmployeeID: employee.EmployeeID },  // Fetch records for the current employee
                include: [
                    {
                        model: Employee,
                        as: 'Employee',
                        attributes: ['EmployeeID', 'Name']
                    },
                    {
                        model: Employee,
                        as: 'Evaluator',
                        attributes: ['EmployeeID', 'Name']
                    }
                ]
            });

            // Fetch all salary records associated with the current employee
            const salaryRecords = await Salary.findAll({
                where: { EmployeeID: employee.EmployeeID }
            });

            return {
                employee: employee,
                performanceStats: performanceStats,
                salaryRecords: salaryRecords
            };
        });

        // Resolve all employee details (performance stats and salary records)
        const employeeDetails = await Promise.all(employeeDetailsPromises);

        // Return the employee details
        return res.status(200).json({
            employees: employeeDetails
        });

    } catch (err) {
        console.error('Error retrieving employees under supervisor:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
    }
};

exports.getEmployeeDetails = async (req, res) => {
    const { employeeID } = req.params;
    const { employeeId } = req.user;  // Extract employeeId from request params
    try {
        const employee = await Employee.findOne({
            where: { EmployeeID: employeeID, SupervisorID: employeeId }, // Match employeeId and SupervisorID
            attributes: ['EmployeeID', 'Name', 'SupervisorID']
        });

        // If no such employee exists, deny access
        if (!employee) {
            return res.status(403).json({
                error: 'You are not authorized to evaluate this employee. Only supervisors can evaluate their employees.'
            });
        }
        // Fetch performance stats for the employee
        const performanceStats = await PerformanceStats.findAll({
            where: {
                EmployeeID: employeeID  // Fetch records for the given EmployeeID
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
            where: { EmployeeID: employeeID }
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
    const { employeeID } = req.params;
    const { employeeId } = req.user;
    try {
       const employee = await Employee.findOne({
            where: { EmployeeID: employeeID, SupervisorID: employeeId }, // Match employeeId and SupervisorID
            attributes: ['EmployeeID', 'Name', 'SupervisorID']
       });

        // If no such employee exists, deny access
       if (!employee) {
            return res.status(403).json({
                error: 'You are not authorized to evaluate this employee. Only supervisors can evaluate their employees.'
            });
       }
      // Ensure employeeID is provided
      if (!employeeID) {
        return res.status(400).json({ message: 'Employee ID is required.' });
      }
  
      console.log('Employee ID:', employeeID);
  
      // Find the current salary record for the employee
      const currentSalary = await CurrentSalaries.findOne({ where: { EmployeeID: employeeID } }); // Updated to match column name
  
      if (!currentSalary) {
        console.log('No current salary record found for employee ID:', employeeID);
        return res.status(404).json({ message: 'No salary record found for this employee.' });
      }
  
      const salaryID = currentSalary.SalaryID; // Updated to match column name
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
    const { employeeID } = req.params;
    const { employeeId } = req.user; // Extract employeeID from request parameters

    try {
        // Verify if the employee belongs to the supervisor (if applicable)
        const employee = await Employee.findOne({
            where: { EmployeeID: employeeID, SupervisorID: employeeId }, // Match employeeId and SupervisorID
            attributes: ['EmployeeID', 'Name', 'SupervisorID']
       });

        // If no such employee exists, deny access
        if (!employee) {
            return res.status(404).json({
                error: 'Employee not found or you are not authorized to access this record.'
            });
        }

        // Fetch salary records for the employee
        const salaryRecords = await Salary.findAll({
            where: { EmployeeID: employeeID }
        });

        // If no salary records exist, return a 404 response
        if (salaryRecords.length === 0) {
            return res.status(404).json({
                message: 'No salary records found for this employee.'
            });
        }

        // Return the salary records
        return res.status(200).json(salaryRecords);

    } catch (error) {
        console.error('Error fetching salary records:', error.message);

        // Handle internal server errors
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

  

exports.getPerformanceStats = async (req, res) => {
    const employeeID = req.params.employeeId;
    const { employeeId } = req.user;
    try {
        const employee = await Employee.findOne({
            where: { EmployeeID: employeeID, SupervisorID: employeeId }, // Match employeeId and SupervisorID
            attributes: ['EmployeeID', 'Name', 'SupervisorID']
       });
        // Fetch performance stats for the given EmployeeID
        const performanceStats = await PerformanceStats.findAll({
            where: {
                EmployeeID: employeeID  // Find records for the given EmployeeID
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
      const { id } = req.params;
      const { employeeId } = req.user;
      const employee = await Employee.findOne({
        where: { EmployeeID: id, SupervisorID: employeeId }, // Match employeeId and SupervisorID
        attributes: ['EmployeeID', 'Name', 'SupervisorID']
      });
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.status(200).json(employee);
    } catch (error) {
      console.error('Error fetching employee by ID:', error.message); 
      res.status(500).json({ error: 'Failed to fetch employee' });
    }
  };


  //supervisor details (for them)

const Employee = require('../models/Employee');
const PerformanceStats = require('../models/PerformanceStats');
const CurrentSalaries = require('../models/CurrentSalary')
const Salary = require('../models/Salary')
const bcrypt = require('bcrypt');
//const Authentication = require('../models/Authentication');
// controllers/empController.js
// Insert User Function
const jwt = require('jsonwebtoken');
// Secret key for signing the JWT (store securely, e.g., in environment variables)


exports.login = async (req, res) => {
  const { username, password, employeeId } = req.body;

  try {
    // Find the user in the Authentication table
    const user = await Authentication.findOne({ where: { username, employeeId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found or invalid employee ID' });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Fetch the roleID from the Employee table
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const roleID = employee.RoleID; // Assuming the roleID column exists in the Employee table

    // Generate JWT with roleID included
    console.log('Employee ID:', employeeId);
    const token = jwt.sign(
      { id: user.id, username: user.username, roleID, employeeId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      employeeId,
      roleID
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.insertcreds = async (req, res) => {
  const { username, password, employeeId } = req.body;

  try {
    // Validate input
    if (!username || !password || !employeeId) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if the employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Check if the username already exists
    const existingUser = await Authentication.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the authentication record
    const newAuthentication = await Authentication.create({
      username,
      password: hashedPassword,
      employeeId,
    });

    return res.status(201).json({
      message: 'Authentication created successfully.',
      authentication: newAuthentication,
    });
  } catch (error) {
    console.error('Error adding authentication:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


exports.addEvaluation = async (req, res) => {
    const { employeeID, grade, evaluationDate, comments } = req.body;
    const evaluatorID = req.params.evaluatorID;  // The evaluator submitting the evaluation

    // Validate the required fields
    if (!employeeID || !grade || !evaluationDate || !evaluatorID) {
        return res.status(400).json({ error: 'Missing required fields. Please provide employeeId, grade, evaluationDate, and evaluatorId.' });
    }

    try {
        // Create a new evaluation record in the PerformanceStats table
        const newEvaluation = await PerformanceStats.create({
            EmployeeID: employeeID,
            Grade: grade,
            EvaluationDate: evaluationDate,
            Comments: comments,
            EvaluatorID: evaluatorID
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
    const evaluatorID = req.params.evaluatorID;

    try {
        // Fetch all performance stats where the evaluator is the given EvaluatorID
        const evaluations = await PerformanceStats.findAll({
            where: {
                EvaluatorID: evaluatorID  // Find records where EvaluatorID matches the given evaluator
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

exports.getEmployeeDetails = async (req, res) => {
    const { employeeID } = req.params;  // Extract employeeId from request params
    try {
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
  
    try {
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
  
  
exports.addSalary = async (req, res) => {
    const { EmployeeID, BasicPay, Allowances = 0.00, Deductions = 0.00, Bonuses = 0.00, Date } = req.body;
  
    try {
      const employee = await Employee.findByPk(EmployeeID);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      // Calculate Net Salary
      const NetSalary = BasicPay + Allowances + Bonuses - Deductions;
  
      // Create a new salary record
      const salary = await Salary.create({
        EmployeeID,
        BasicPay,
        Allowances,
        Deductions,
        Bonuses,
        NetSalary,
        Date
      });
  
      // Check if a record exists in current_salary for the employee
      const currentSalaryRecord = await CurrentSalaries.findOne({
        where: { EmployeeID }
      });
  
      if (currentSalaryRecord) {
        // If a current salary record exists, update it with the new salaryID
        currentSalaryRecord.SalaryID = salary.SalaryID;
        await currentSalaryRecord.save();
      } else {
        // If no current salary record exists, create a new one
        await CurrentSalaries.create({
          EmployeeID,
          SalaryID: salary.SalaryID
        });
      }
  
      res.status(201).json(salary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
exports.getSalaryRecords = async (req, res) => {
    const { employeeID } = req.params;
    
    try {
      const salaryRecords = await Salary.findAll({
        where: { EmployeeID: employeeID },
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
    const employeeID = req.params.employeeID;

    try {
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

exports.addEmployee = async (req, res) => {
    try {
        const { Name, Department, ContactNo, Address, Email, RoleID, DateOfJoining, SupervisorID } = req.body;

        // Validate required fields
        if (!Name || !Email || !RoleID) {
            return res.status(400).json({ error: 'Name, Email, and RoleID are required.' });
        }

        // If DateOfJoining is not provided, set it to the current date
        const joiningDate = DateOfJoining || new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // Create new employee
        const employee = await Employee.create({
            Name,
            Department,
            ContactNo,
            Address,
            Email,
            RoleID, // RoleID is used instead of Role
            DateOfJoining: joiningDate,
            SupervisorID // Use the calculated or provided DateOfJoining
        });

        res.status(201).json({
            message: 'Employee added successfully.',
            employee,
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Validation error: ' + error.errors.map(e => e.message).join(', ') });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to add employee. Please try again later.' });
    }
};


exports.getAllEmployees = async (req, res) => {
    try {
      const employees = await Employee.findAll();
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
  };
  
  // Get an employee by ID
exports.getEmployeById = async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findByPk(id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.status(200).json(employee);
    } catch (error) {
      console.error('Error fetching employee by ID:', error.message); 
      res.status(500).json({ error: 'Failed to fetch employee' });
    }
  };

  exports.getmydet = async (req, res) => {
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
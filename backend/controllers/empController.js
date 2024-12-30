const Employee = require('../models/Employee');

exports.addEmployee = async (req, res) => {
    try {
        const { Name, Department, ContactNo, Address, Email, Role, DateOfJoining } = req.body;
        if (!Name || !Email || !DateOfJoining) {
            return res.status(400).json({ error: 'Name, Email, and Date of Joining are required.' });
        }
        const employee = await Employee.create({
            Name,
            Department,
            ContactNo,
            Address,
            Email,
            Role,
            DateOfJoining,
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

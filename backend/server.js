const express = require('express');
const sequelize = require('./config/database');
const employeeRoutes = require('./routes/employee');
const supervisorRoutes = require('./routes/supervisor');
const adminRoutes = require('./routes/admin');
const roleMiddleware = require('./middleware/rolemid');
const empController = require('./controllers/AdController')

require('dotenv').config();  
const app = express();
// Middleware to parse JSON
app.use(express.json());
app.post('/api/login', empController.login);
// Route definitions
app.use('/api/employees',roleMiddleware(3), employeeRoutes);
app.use('/api/supervisors', roleMiddleware(1),supervisorRoutes);
app.use('/api/admins', roleMiddleware(2),adminRoutes);

// Test database connection and sync
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    // Sync the database models
    return sequelize.sync({ alter: true }); // Use `{ force: true }` to reset if needed
  })
  .then(() => {
    console.log('Database synced.');
  })
  .catch(err => {
    console.error('Database connection or sync failed:', err);
  });

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

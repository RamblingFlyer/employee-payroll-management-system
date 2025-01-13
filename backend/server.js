const express = require('express');
const sequelize = require('./config/database');
const employeeRoutes = require('./routes/employee');

const app = express();
// Middleware to parse JSON
app.use(express.json());

// Employee routes
app.use('/api/employees', employeeRoutes);

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

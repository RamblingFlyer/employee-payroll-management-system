const express = require('express');
const sequelize = require('./config/database');
const employeeRoutes = require('./routes/employee');

const app = express();
// Middleware to parse JSON
app.use(express.json());

// Employee routes
app.use('/api/employees', employeeRoutes);

// Test database connection and sync
sequelize.sync()
  .then(() => {
    console.log('Database connected and synced.');
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

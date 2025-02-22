const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const db = require('./configs/db'); // Import the db connection
const { systemLogger } = require('./logger'); // Import the custom systemLogger

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MySQL and log the status
db.connect((err) => {
   if (err) {
      systemLogger.error('Error connecting to MySQL: ' + err.stack);
      process.exit(1); // Exit the process if the database connection fails
   }
   systemLogger.info('Connected to MySQL Database');
});

// Log every incoming request
app.use((req, res, next) => {
   systemLogger.info(`${req.method} ${req.url}`);
   next();
});

// Add your routes here
app.use('/api', routes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
   systemLogger.error('Unhandled error:', err);
   res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
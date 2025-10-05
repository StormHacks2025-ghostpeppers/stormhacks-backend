const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add this import
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const inventoryRoutes = require('./routes/inventory');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const { method, url, headers, body, query } = req;
    
    console.log(`\n=== INCOMING REQUEST [${timestamp}] ===`);
    console.log(`${method} ${url}`);
    console.log(`Headers:`, JSON.stringify(headers, null, 2));
    
    if (Object.keys(query).length > 0) {
        console.log(`Query Params:`, JSON.stringify(query, null, 2));
    }
    
    if (body && Object.keys(body).length > 0) {
        // Don't log sensitive information like passwords
        const sanitizedBody = { ...body };
        if (sanitizedBody.password) {
            sanitizedBody.password = '[REDACTED]';
        }
        console.log(`Body:`, JSON.stringify(sanitizedBody, null, 2));
    }

    // Store original res.json to intercept responses
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override res.json to log responses
    res.json = function(data) {
        console.log(`\n=== RESPONSE [${timestamp}] ===`);
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Data:`, JSON.stringify(data, null, 2));
        console.log(`==========================================\n`);
        return originalJson.call(this, data);
    };

    // Override res.send to log responses that don't use json
    res.send = function(data) {
        console.log(`\n=== RESPONSE [${timestamp}] ===`);
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Data:`, data);
        console.log(`==========================================\n`);
        return originalSend.call(this, data);
    };

    next();
};

// Configure CORS - DEVELOPMENT ONLY
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5175',
      'http://localhost:3000',
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Now corsOptions is properly defined

// Apply request logging middleware before other middleware
app.use(requestLogger);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware to catch and log all errors
const errorLogger = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    
    console.log(`\n=== ERROR [${timestamp}] ===`);
    console.log(`Request: ${req.method} ${req.url}`);
    console.log(`Error:`, err.message);
    console.log(`Stack:`, err.stack);
    console.log(`================================\n`);
    
    // Send error response
    if (!res.headersSent) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
        });
    }
};

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/inventory', inventoryRoutes);

// Apply error logging middleware after routes
app.use(errorLogger);

// Handle 404 routes
app.use('*', (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`\n=== 404 NOT FOUND [${timestamp}] ===`);
    console.log(`${req.method} ${req.originalUrl}`);
    console.log(`=====================================\n`);
    
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Logging enabled for all requests and responses`);
});

module.exports = { app, prisma };
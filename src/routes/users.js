const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

// Validation for user profile updates
const updateUserValidation = [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
];

// Define routes related to user management
// Example: Fetch user profile (protected route)
router.get('/:id', authenticate, userController.getUserProfile);

// Example: Update user information (protected route with validation)
router.put('/:id', authenticate, updateUserValidation, validate, userController.updateUserProfile);

module.exports = router;
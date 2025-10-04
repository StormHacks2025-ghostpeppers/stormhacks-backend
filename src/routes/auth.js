const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');

// POST /auth/register
router.post('/register', registerValidation, validate, authController.register);

// POST /auth/login
router.post('/login', loginValidation, validate, authController.login);

module.exports = router;
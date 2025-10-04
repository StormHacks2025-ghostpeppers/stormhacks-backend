const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authenticate = require('../middleware/auth');
const { ingredientValidation, inventoryValidation, validate } = require('../middleware/validation');

// Get user's food inventory
router.get('/', authenticate, inventoryController.getInventory);

// Update entire inventory
router.put('/', authenticate, inventoryValidation, validate, inventoryController.updateInventory);

// Add a single ingredient
router.post('/ingredient', authenticate, ingredientValidation, validate, inventoryController.addIngredient);

// Remove a single ingredient
router.delete('/ingredient/:ingredientId', authenticate, inventoryController.removeIngredient);

module.exports = router;
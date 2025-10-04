const { body, validationResult } = require('express-validator');

const registerValidation = [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
];

const ingredientValidation = [
    body('ingredient.name').notEmpty().withMessage('Ingredient name is required.'),
    body('ingredient.quantity').optional().isNumeric().withMessage('Quantity must be a number.'),
    body('ingredient.unit').optional().isString().withMessage('Unit must be a string.'),
];

const inventoryValidation = [
    body('ingredients').isArray().withMessage('Ingredients must be an array.'),
    body('ingredients.*.name').notEmpty().withMessage('Each ingredient must have a name.'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    registerValidation,
    loginValidation,
    ingredientValidation,
    inventoryValidation,
    validate,
};
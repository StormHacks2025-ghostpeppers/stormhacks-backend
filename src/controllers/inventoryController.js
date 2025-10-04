const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getInventory = async (req, res) => {
    const userId = req.userId; // From auth middleware

    try {
        let inventory = await prisma.foodInventory.findUnique({
            where: { userId: parseInt(userId) }
        });

        if (!inventory) {
            // Create empty inventory if none exists
            inventory = await prisma.foodInventory.create({
                data: {
                    userId: parseInt(userId),
                    ingredients: JSON.stringify([])
                }
            });
        }

        const ingredients = JSON.parse(inventory.ingredients);
        res.status(200).json({ 
            success: true,
            inventory: {
                id: inventory.id,
                ingredients,
                updatedAt: inventory.updatedAt
            }
        });
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateInventory = async (req, res) => {
    const userId = req.userId;
    const { ingredients } = req.body;

    try {
        // Validate ingredients format
        if (!Array.isArray(ingredients)) {
            return res.status(400).json({ 
                message: 'Ingredients must be an array',
                expected: 'Array of objects with name, quantity, unit, etc.'
            });
        }

        const inventory = await prisma.foodInventory.upsert({
            where: { userId: parseInt(userId) },
            update: {
                ingredients: JSON.stringify(ingredients)
            },
            create: {
                userId: parseInt(userId),
                ingredients: JSON.stringify(ingredients)
            }
        });

        res.status(200).json({ 
            success: true,
            message: 'Inventory updated successfully',
            inventory: {
                id: inventory.id,
                ingredients: JSON.parse(inventory.ingredients),
                updatedAt: inventory.updatedAt
            }
        });
    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addIngredient = async (req, res) => {
    const userId = req.userId;
    const { ingredient } = req.body;

    try {
        // Validate ingredient format
        if (!ingredient || !ingredient.name) {
            return res.status(400).json({ 
                message: 'Ingredient must have at least a name',
                expected: '{ name: string, quantity?: number, unit?: string, expiryDate?: string }'
            });
        }

        let inventory = await prisma.foodInventory.findUnique({
            where: { userId: parseInt(userId) }
        });

        if (!inventory) {
            inventory = await prisma.foodInventory.create({
                data: {
                    userId: parseInt(userId),
                    ingredients: JSON.stringify([])
                }
            });
        }

        const ingredients = JSON.parse(inventory.ingredients);
        
        // Check if ingredient already exists
        const existingIndex = ingredients.findIndex(item => 
            item.name.toLowerCase() === ingredient.name.toLowerCase()
        );

        if (existingIndex >= 0) {
            // Update existing ingredient
            ingredients[existingIndex] = { ...ingredients[existingIndex], ...ingredient };
        } else {
            // Add new ingredient
            ingredients.push({
                id: Date.now().toString(), // Simple ID generation
                name: ingredient.name,
                quantity: ingredient.quantity || 1,
                unit: ingredient.unit || 'piece',
                expiryDate: ingredient.expiryDate || null,
                addedAt: new Date().toISOString()
            });
        }

        const updatedInventory = await prisma.foodInventory.update({
            where: { userId: parseInt(userId) },
            data: { ingredients: JSON.stringify(ingredients) }
        });

        res.status(200).json({ 
            success: true,
            message: 'Ingredient added successfully',
            inventory: {
                id: updatedInventory.id,
                ingredients: JSON.parse(updatedInventory.ingredients),
                updatedAt: updatedInventory.updatedAt
            }
        });
    } catch (error) {
        console.error('Add ingredient error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const removeIngredient = async (req, res) => {
    const userId = req.userId;
    const { ingredientId } = req.params;

    try {
        const inventory = await prisma.foodInventory.findUnique({
            where: { userId: parseInt(userId) }
        });

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory not found' });
        }

        const ingredients = JSON.parse(inventory.ingredients);
        const filteredIngredients = ingredients.filter(item => item.id !== ingredientId);

        if (ingredients.length === filteredIngredients.length) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }

        const updatedInventory = await prisma.foodInventory.update({
            where: { userId: parseInt(userId) },
            data: { ingredients: JSON.stringify(filteredIngredients) }
        });

        res.status(200).json({ 
            success: true,
            message: 'Ingredient removed successfully',
            inventory: {
                id: updatedInventory.id,
                ingredients: JSON.parse(updatedInventory.ingredients),
                updatedAt: updatedInventory.updatedAt
            }
        });
    } catch (error) {
        console.error('Remove ingredient error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getInventory,
    updateInventory,
    addIngredient,
    removeIngredient,
};
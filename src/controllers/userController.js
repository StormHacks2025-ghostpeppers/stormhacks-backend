const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserProfile = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                email: true,
                createdAt: true,
                // Don't select password for security
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateUserProfile = async (req, res) => {
    const userId = req.params.id;
    const { email } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { email },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });

        res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
};
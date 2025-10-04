const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }, // Normalize email to lowercase
        });

        if (existingUser) {
            console.log(`Registration attempt failed: ${email} already exists`);
            return res.status(409).json({ 
                message: 'User with this email already exists',
                error: 'DUPLICATE_EMAIL' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email: email.toLowerCase(), // Store email in lowercase
                password: hashedPassword,
            },
        });

        console.log(`${email} user has registered`);
        res.status(201).json({ 
            message: 'User registered successfully', 
            userId: newUser.id 
        });
    } catch (error) {
        // Handle Prisma unique constraint violation
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            console.log(`Registration attempt failed: ${email} already exists (database constraint)`);
            return res.status(409).json({ 
                message: 'User with this email already exists',
                error: 'DUPLICATE_EMAIL' 
            });
        }
        
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }, // Normalize email for login too
        });

        if (!user) {
            console.log(`Login attempt failed: ${email} not found`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Login attempt failed: Invalid password for ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);
        console.log(`${email} user has logged in`);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
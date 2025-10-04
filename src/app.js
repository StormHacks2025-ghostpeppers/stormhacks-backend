const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const inventoryRoutes = require('./routes/inventory');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/inventory', inventoryRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, prisma };
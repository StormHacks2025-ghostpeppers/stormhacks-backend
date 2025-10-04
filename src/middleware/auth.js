const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided!' });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

    try {
        const decoded = verifyToken(token);
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized!' });
    }
};

module.exports = authenticate;
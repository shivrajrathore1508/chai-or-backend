const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model

// Middleware to protect routes
const authMiddleware = async (req, res, next) => {

    // Get the token from Authorization header
    // const token = req.header('Authorization')?.replace('Bearer ', '');
    // console.log(token); // Log the token to see if it's being retrieved

    const token = req.cookies.authToken;
    console.log("newcookie "+req.cookies.authToken);

    if (!token) {
        return res.redirect('/');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        if (user.role !== 'user') {
            return res.status(403).json({ message: 'Forbidden: Admins only.' });
        }

        req.user = user;
        next();  // Continue to the protected route
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        }
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;

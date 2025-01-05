const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const router = express.Router();

// Function to send OTP via email
const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. Please use it to complete your verification.`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};

// POST route for user login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        await user.save();

        // Send OTP to email
        await sendOtpEmail(user.email, otp);

        res.status(200).json({ userId: user._id, message: 'OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ message: 'Error during login', error: err.message });
    }
});

// POST route for user registration
router.post('/register', async (req, res) => {
    const { username, password, email, phone } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000);
        const newUser = new User({ username, password: hashedPassword, email, phone, otp });

        await newUser.save();

        // Send OTP to email
        await sendOtpEmail(newUser.email, otp);

        res.status(200).json({ userId: newUser._id, message: 'OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ message: 'Error during registration', error: err.message });
    }
});
// POST route for OTP verification
router.post('/verify-otp', async (req, res) => {
    const { userId, otp } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user || user.otp !== parseInt(otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Clear the OTP and save the user
        user.otp = null;
        await user.save();

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set token in an HTTP-only cookie
        res.cookie('authToken', token, {
            httpOnly: true, // Prevent client-side JavaScript access
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000 // 1 hour in milliseconds
        });

        // Set the token in the Authorization header
        res.set('Authorization', `Bearer ${token}`);

        // Send response to the client
        res.status(200).json({ 
            message: 'OTP verified successfully', 
            token // Optional: Send token in response body if needed for debugging or frontend usage
        });
    } catch (err) {
        res.status(500).json({ message: 'Error during OTP verification', error: err.message });
    }
});

module.exports = router;

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Send OTP via email
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
        subject: 'OTP Verification',
        text: `Your OTP is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Generate OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

// Register a new user
const register = async (req, res) => {
    const { username, password, email, phone } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();

        const user = new User({ username, password: hashedPassword, email, phone, otp, otpExpiry: Date.now() + 10 * 60 * 1000 });  // OTP expiry 10 minutes
        await user.save();

        await sendOtpEmail(email, otp);

        res.status(201).json({ message: 'User registered successfully! Check your email for OTP.', userId: user._id });
    } catch (err) {
        console.error('Registration failed:', err.message);
        res.status(500).json({ message: 'Registration failed: ' + err.message });
    }
};

// Login user
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;  // OTP expiry 10 minutes
        await user.save();

        await sendOtpEmail(user.email, otp);

        res.status(200).json({ message: 'OTP sent, verify it to continue', userId: user._id });
    } catch (err) {
        console.error('Login failed:', err.message);
        res.status(500).json({ message: 'Login failed: ' + err.message });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP is valid and not expired
        if (user.otp !== parseInt(otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (Date.now() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
        }

        user.otp = null;  // Clear OTP after successful verification
        user.otpExpiry = null;  // Clear OTP expiry time
        await user.save();

        const token = jwt.sign({ userId: user[0]._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'OTP verified successfully', token });
    } catch (err) {
        console.error('OTP verification failed:', err.message);
        res.status(500).json({ message: 'OTP verification failed: ' + err.message });
    }
};

module.exports = { register, login, verifyOtp };

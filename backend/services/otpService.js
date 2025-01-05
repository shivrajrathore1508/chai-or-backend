// services/otpService.js
const nodemailer = require('nodemailer');

// Generate a 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

// Send OTP via email (you can integrate SMS using services like Twilio)
const sendOtp = (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending OTP:', error);
        } else {
            console.log('OTP sent: ' + info.response);
        }
    });
};

module.exports = { generateOtp, sendOtp };

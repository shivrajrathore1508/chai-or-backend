const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Set up Twilio for SMS
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Set up Nodemailer for email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send OTP via email
const sendOtpEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Admin Login',
        text: `Your OTP is: ${otp}`,
    };

    return transporter.sendMail(mailOptions);
};

// Function to send OTP via SMS (Twilio)
const sendOtpSMS = (mobile, otp) => {
    return twilioClient.messages.create({
        body: `Your OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: mobile,
    });
};

module.exports = { sendOtpEmail, sendOtpSMS };

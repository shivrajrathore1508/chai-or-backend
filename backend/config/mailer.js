const nodemailer = require('nodemailer');

console.log(process.env.SMTP_HOST);
console.log(process.env.SMTP_PORT);
console.log(process.env.SMTP_USER);
console.log(process.env.SMTP_PASS);


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || 'your-email@example.com',
        pass: process.env.SMTP_PASS || 'your-email-password',
    },
});

module.exports = transporter;

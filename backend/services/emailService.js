const transporter = require('../config/mailer');

const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: '"Your App Name" <your-email@example.com>',
            to,
            subject,
            text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendEmail };

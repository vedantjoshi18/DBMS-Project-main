require('dotenv').config(); // Load .env from current directory
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('Testing Email Configuration...');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Pass length:', process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.length : 0);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });

    try {
        console.log('Attempting to send mail...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from EventHub Debugger',
            text: 'If you see this, Nodemailer is working correctly!'
        });
        console.log('✅ Success! Message sent:', info.messageId);
    } catch (error) {
        console.error('❌ Failed:', error);
    }
};

testEmail();

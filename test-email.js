// Quick email test for debugging
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'YOUR_GMAIL@gmail.com', // Replace with actual
    pass: 'YOUR_APP_PASSWORD'     // Replace with 16-char app password
  }
});

transporter.sendMail({
  from: 'YOUR_GMAIL@gmail.com',
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'Email configuration working!'
}).then(() => {
  console.log('✅ Email sent successfully!');
}).catch(err => {
  console.error('❌ Email failed:', err.message);
});
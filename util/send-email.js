const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or SendGrid/Mailgun
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: 'no-reply@yourapp.com',
    to: email,
    subject: 'Email Verification',
    html: `<p>Your Places App verification code is: <b>${verificationToken}</b></p>`
  }; 
  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
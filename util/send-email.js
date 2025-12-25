const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, verificationToken) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev', // works without domain setup
    to: email,
    subject: 'Email Verification',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${verificationToken}</h1>
      <p>This code expires in 1 hour.</p>
    `
  });
};

module.exports = sendVerificationEmail;

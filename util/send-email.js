const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, verificationToken) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Places App 👋</h2>
        <p>Thanks for signing up!</p>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 3px;">${verificationToken}</h1>
        <p>This code will expire in <strong>1 hour</strong>.</p>
        <p>If you didn’t create this account, you can safely ignore this email.</p>
      </div>
    `
  });
};

module.exports = sendVerificationEmail;

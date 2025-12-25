const sendVerificationEmail = async (email, verificationToken) => {
  console.log('📨 Attempting Resend email…');

  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Verify your email',
    html: `<h1>${verificationToken}</h1>`
  });

  console.log('📬 Resend response:', response);
};

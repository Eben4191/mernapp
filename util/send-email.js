const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];

apiKey.apiKey = process.env.BREVO_API_KEY;

const sendVerificationEmail = async (email, verificationToken) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  await apiInstance.sendTransacEmail({
    sender: {
      email: 'ebenfx6@gmail.com', // ✅ must be your verified email
      name: 'Places App'
    },
    to: [
      {
        email: email
      }
    ],
    subject: 'Verify your email address',
    htmlContent: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome to Places App 👋</h2>
        <p>Your verification code is:</p>
        <h1>${verificationToken}</h1>
        <p>This code expires in 1 hour.</p>
      </div>
    `
  });
};

module.exports = sendVerificationEmail;

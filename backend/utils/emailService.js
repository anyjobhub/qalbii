import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export const sendOTPEmail = async (email, otp, username) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = 'Qalbi - Password Reset OTP';
        sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Qalbi Password Reset</h1>
            </div>
            <div class="content">
              <p>Hi ${username || 'there'},</p>
              <p>You requested to reset your password for your Qalbi account. Use the OTP below to continue:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p><strong>This OTP will expire in 5 minutes.</strong></p>
              <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
              <div class="footer">
                <p>This is an automated email from Qalbi. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
        sendSmtpEmail.sender = {
            name: process.env.BREVO_SENDER_NAME || 'Qalbi',
            email: process.env.BREVO_SENDER_EMAIL,
        };
        sendSmtpEmail.to = [{ email: email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ OTP email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

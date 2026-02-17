// Activation Email Template
export const activationEmailTemplate = (name, activationLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activate Your Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">SkillSwap</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hi ${name}!</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Welcome to SkillSwap! We're excited to have you join our community of learners and teachers.
              </p>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                To get started, please activate your account by clicking the button below. This link will expire in <strong>1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${activationLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Activate My Account</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:<br>
                <a href="${activationLink}" style="color: #667eea; word-break: break-all;">${activationLink}</a>
              </p>

              <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                If you didn't create an account with SkillSwap, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} SkillSwap. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// OTP Email Template
export const otpEmailTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">SkillSwap</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Your Login Code</h2>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Use the following One-Time Password (OTP) to log in to your SkillSwap account. This code will expire in <strong>10 minutes</strong>.
              </p>

              <!-- OTP Code -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <div style="display: inline-block; padding: 20px 60px; background-color: #f0f4ff; border: 2px dashed #667eea; border-radius: 8px;">
                      <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${otp}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #ff6b6b; font-size: 14px; line-height: 1.6; font-weight: bold;">
                ⚠️ Security Warning
              </p>
              <p style="margin: 10px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Never share this code with anyone. SkillSwap staff will never ask for your OTP.
              </p>

              <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                If you didn't request this code, please ignore this email and ensure your account is secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} SkillSwap. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Welcome Email Template
export const welcomeEmailTemplate = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SkillSwap!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Welcome to SkillSwap!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hi ${name}!</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Your account is now active! You're all set to start your learning journey with SkillSwap.
              </p>

              <h3 style="margin: 30px 0 15px 0; color: #333333; font-size: 18px;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 16px; line-height: 1.8;">
                <li>Browse our marketplace of skills and teachers</li>
                <li>Book your first session with an expert teacher</li>
                <li>Share your own skills and start teaching</li>
                <li>Earn and spend tokens for learning</li>
              </ul>

              <p style="margin: 30px 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                As a welcome gift, you've received <strong>50 free tokens</strong> to get started!
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${process.env.FRONTEND_URL}/home" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Explore SkillSwap</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} SkillSwap. All rights reserved.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Need help? Contact us at support@skillswap.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Ban Email Template
export const banEmailTemplate = (name, reason) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Suspended</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Account Suspended</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hi ${name},</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                We're writing to inform you that your SkillSwap account has been suspended.
              </p>
              <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 16px; line-height: 1.6;">
                  <strong>Reason for Suspension:</strong><br>
                  ${reason || 'Violation of our Terms of Service'}
                </p>
              </div>
              <h3 style="margin: 30px 0 15px 0; color: #333333; font-size: 18px;">What This Means:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 16px; line-height: 1.8;">
                <li>You will not be able to log in to your account</li>
                <li>Your scheduled sessions have been cancelled</li>
                <li>You cannot participate in the SkillSwap marketplace</li>
              </ul>
              <p style="margin: 30px 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                If you believe this suspension was made in error or would like to appeal, please contact our support team.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} SkillSwap. All rights reserved.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">support@skillswap.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

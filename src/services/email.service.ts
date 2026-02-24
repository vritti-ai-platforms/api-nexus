import { BrevoClient, BrevoError, BrevoTimeoutError } from '@getbrevo/brevo';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevoClient: BrevoClient;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');

    if (!apiKey) {
      this.logger.error('BREVO_API_KEY is not configured. Email sending will fail.');
      throw new Error('Email service configuration error: Missing BREVO_API_KEY');
    }

    // Initialize Brevo client with built-in retry support
    this.brevoClient = new BrevoClient({ apiKey, maxRetries: 3 });

    // Get sender configuration
    const senderEmail = this.configService.get<string>('SENDER_EMAIL');
    const senderName = this.configService.get<string>('SENDER_NAME');

    if (!senderEmail || !senderName) {
      this.logger.error('Sender email or name is not configured.');
      throw new Error('Email service configuration error: Missing SENDER_EMAIL or SENDER_NAME');
    }

    this.senderEmail = senderEmail;
    this.senderName = senderName;

    this.logger.log('Brevo email service initialized successfully');
  }

  // Sends a password reset OTP email to the given address
  async sendPasswordResetEmail(email: string, otp: string, expiresAt: Date, displayName?: string): Promise<void> {
    const name = displayName || 'there';
    const expiryMinutes = Math.ceil((expiresAt.getTime() - Date.now()) / 60_000);
    const subject = 'Reset Your Password - Vritti API Nexus';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
                      <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Password Reset</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hello <strong>${name}</strong>,
                      </p>
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Use the following code to complete the process:
                      </p>

                      <!-- OTP Box -->
                      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
                        <div style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace;">
                          ${otp}
                        </div>
                      </div>

                      <p style="margin: 30px 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                        <strong>Important:</strong> This code will expire in <strong>${expiryMinutes} minute${expiryMinutes === 1 ? '' : 's'}</strong>.
                      </p>
                      <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                        If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                      </p>
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 20px; border-radius: 4px;">
                        <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.5;">
                          <strong>Security Tip:</strong> Never share this code with anyone. Vritti will never ask for your verification code.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; border-top: 1px solid #e0e0e0; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                        Vritti API Nexus
                      </p>
                      <p style="margin: 8px 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                        This is an automated message, please do not reply.
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

    const textContent = `
Hello ${name},

We received a request to reset your password. Use the following code to complete the process:

Reset Code: ${otp}

This code will expire in ${expiryMinutes} minute${expiryMinutes === 1 ? '' : 's'}.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

SECURITY TIP: Never share this code with anyone. Vritti will never ask for your verification code.

---
Vritti API Nexus
This is an automated message, please do not reply.
    `.trim();

    await this.sendEmail({
      to: [{ email, name }],
      subject,
      htmlContent,
      textContent,
    });

    this.logger.log(`Password reset email sent to ${email}`);
  }

  // Sends a transactional email via Brevo — retries handled internally by BrevoClient
  private async sendEmail(emailData: {
    to: Array<{ email: string; name?: string }>;
    subject: string;
    htmlContent: string;
    textContent: string;
  }): Promise<void> {
    try {
      const result = await this.brevoClient.transactionalEmails.sendTransacEmail({
        sender: { email: this.senderEmail, name: this.senderName },
        to: emailData.to,
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        textContent: emailData.textContent,
      });
      this.logger.debug(`Email sent successfully. Message ID: ${result.messageId}`);
    } catch (err) {
      if (err instanceof BrevoTimeoutError) {
        this.logger.error('Brevo request timed out after retries.');
        throw new Error('Email sending failed: timeout');
      }
      if (err instanceof BrevoError) {
        if (err.statusCode === 429) {
          this.logger.error('Brevo rate limit exceeded after retries.');
          throw new Error('Email sending failed: rate limit exceeded');
        }
        if (err.statusCode === 401) {
          this.logger.error('Brevo authentication failed. Check your API key.');
          throw new Error('Email service authentication failed');
        }
        if (err.statusCode === 400) {
          this.logger.error('Bad request to Brevo API:', err.message);
          throw new Error(`Invalid email parameters: ${err.message}`);
        }
        this.logger.error(`Brevo API error ${err.statusCode}:`, err.message);
        throw new Error(`Email sending failed: ${err.message}`);
      }
      throw err;
    }
  }
}

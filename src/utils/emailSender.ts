import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  message: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; text-align: center;">
            <h2 style="color: #333; margin: 0;">NORA</h2>
          </div>
          <div style="padding: 20px; background: white;">
            ${message}
          </div>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            This email was sent by NORA scheduling system.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
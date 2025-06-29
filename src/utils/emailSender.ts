import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendScheduledEmail(
  to: string,
  title: string,
  description: string,
  callLink: string,
  scheduledTime: string
): Promise<boolean> {
  try {
    const formattedTime = new Date(scheduledTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `Your Nora Tutoring Session: ${title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nora Tutoring Session</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">NORA</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 16px;">Your AI Tutoring Session</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">${title}</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${description}</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Session Details</h3>
                <p style="color: #666; margin: 5px 0; font-size: 16px;"><strong>Date & Time:</strong> ${formattedTime}</p>
              </div>
              
              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${callLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                  Start Meeting
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${callLink}" style="color: #667eea; word-break: break-all;">${callLink}</a>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This email was sent by NORA AI Tutoring System.<br>
                Please join your session on time for the best experience.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Scheduled email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending scheduled email:', error);
    return false;
  }
}
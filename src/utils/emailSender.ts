import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { join } from "path";

const transporter = nodemailer.createTransport({
	service: "gmail",
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
		const formattedTime = new Date(scheduledTime).toLocaleString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			timeZoneName: "short",
		});

		// Load logo as base64
		let logoBase64 = "";
		try {
			const logoPath = join(
				process.cwd(),
				"public",
				"images",
				"logo.png"
			);
			const logoData = readFileSync(logoPath);
			logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;
		} catch (logoError) {
			console.error("Error loading logo:", logoError);
		}

		const mailOptions = {
			from: `"NORA Tutoring" <${process.env.EMAIL_USER}>`,
			to,
			subject: `Your Tutoring Session: ${title}`,
			text: `Your tutoring session "${title}" is scheduled for ${formattedTime}. Join here: ${callLink}`,
			html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NORA Tutoring Session</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header with Logo -->
            <div style="background-color: #1661ff; padding: 40px 20px; text-align: center;">
              ${
					logoBase64
						? `<img src="${logoBase64}" alt="NORA" style="height: 60px; width: auto; display: block; margin: 0 auto;">`
						: '<div style="color: white; font-size: 32px; font-weight: bold;">NORA</div>'
				}
              <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px; font-weight: 500;">Your AI Tutoring Session</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h1 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 28px; font-weight: 600; line-height: 1.3;">${title}</h1>
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 24px 0;">${description}</p>
              
              <!-- Session Details Card -->
              <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px; margin: 24px 0;">
                <h2 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Session Details</h2>
                <div style="color: #4a5568; font-size: 16px;">
                  <strong style="color: #2d3748;">Date & Time:</strong> ${formattedTime}
                </div>
              </div>
              
              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${callLink}" style="display: inline-block; background-color: #1661ff; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(22, 97, 255, 0.3); transition: all 0.2s ease;">
                  Start Meeting
                </a>
              </div>
              
              <!-- Backup Link -->
              <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
                <p style="color: #718096; font-size: 14px; margin: 0 0 8px 0;">If the button doesn't work, copy this link:</p>
                <a href="${callLink}" style="color: #1661ff; font-size: 14px; word-break: break-all; text-decoration: none;">${callLink}</a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f7fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 12px; margin: 0; line-height: 1.5;">
                This email was sent by NORA AI Tutoring System.<br>
                Please join your session on time for the best experience.
              </p>
            </div>
          </div>
          
          <!-- Spacer for email clients -->
          <div style="height: 40px;"></div>
        </body>
        </html>
      `,
		};

		await transporter.sendMail(mailOptions);
		console.log(`Scheduled email sent successfully to ${to}`);
		return true;
	} catch (error) {
		console.error("Error sending scheduled email:", error);
		return false;
	}
}

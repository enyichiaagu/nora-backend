import nodemailer from "nodemailer";
import {
	generateEmailTemplate,
	type EmailTemplateData,
} from "./emailTemplate.js";

const transporter = nodemailer.createTransporter({
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
	scheduledTime: string,
	tutorName: string,
	type: "confirmation" | "reminder" = "reminder"
): Promise<boolean> {
	try {
		const templateData: EmailTemplateData = {
			title,
			description,
			callLink,
			scheduledTime,
			tutorName,
			type,
		};

		const { html, text, logoBase64 } = generateEmailTemplate(templateData);

		const subject = type === "confirmation" 
			? `Session confirmed with ${tutorName}` 
			: `Reminder: Your session with ${tutorName} starts in 2 minutes`;

		const mailOptions = {
			from: `"Nora Tutoring" <${process.env.EMAIL_USER}>`,
			to,
			subject,
			text,
			html,
			attachments: logoBase64
				? [
						{
							filename: "logo.png",
							content: logoBase64.split(",")[1],
							encoding: "base64",
							cid: "logo",
						},
				  ]
				: [],
		};

		await transporter.sendMail(mailOptions);
		console.log(`${type} email sent successfully to ${to}`);
		return true;
	} catch (error) {
		console.error(`Error sending ${type} email:`, error);
		return false;
	}
}
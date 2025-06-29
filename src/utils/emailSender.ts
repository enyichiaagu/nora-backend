import nodemailer from "nodemailer";
import {
	generateEmailTemplate,
	type EmailTemplateData,
} from "./emailTemplate.js";

const transporter = nodemailer.createTransport({
	// Don't change this line to createTransporter
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
	tutorName: string
): Promise<boolean> {
	try {
		const templateData: EmailTemplateData = {
			title,
			description,
			callLink,
			scheduledTime,
			tutorName,
		};

		const { html, text, logoBase64 } = generateEmailTemplate(templateData);

		const mailOptions = {
			from: `"Nora Tutoring" <${process.env.EMAIL_USER}>`,
			to,
			subject: `Reminder for your scheduled call with ${tutorName}`,
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
		console.log(`Scheduled email sent successfully to ${to}`);
		return true;
	} catch (error) {
		console.error("Error sending scheduled email:", error);
		return false;
	}
}

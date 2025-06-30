import { readFileSync } from "fs";
import { join } from "path";

export interface EmailTemplateData {
	title: string;
	description: string;
	callLink: string;
	scheduledTime: string;
	tutorName: string;
	type?: "confirmation" | "reminder";
}

export function generateEmailTemplate(data: EmailTemplateData): {
	html: string;
	text: string;
	logoBase64?: string;
} {
	const formattedTime = new Date(data.scheduledTime).toLocaleString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short",
	});

	const isConfirmation = data.type === "confirmation";
	const headerText = isConfirmation ? "Session Confirmed" : "Session Starting Soon";
	const mainMessage = isConfirmation 
		? `Your tutoring session "${data.title}" with ${data.tutorName} has been confirmed for ${formattedTime}.`
		: `Your tutoring session "${data.title}" with ${data.tutorName} starts in 2 minutes at ${formattedTime}.`;

	// Load logo as base64 with proper error handling
	let logoBase64 = "";
	try {
		const logoPath = join(process.cwd(), "public", "images", "logo.png");
		const logoData = readFileSync(logoPath);
		logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;
	} catch (logoError) {
		console.error("Error loading logo:", logoError);
	}

	const textVersion = `${mainMessage} Description: ${data.description}. Join here: ${data.callLink}`;

	const htmlVersion = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Nora Tutoring Session</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8f9fa; line-height: 1.6; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background-color: #1661ff; padding: 40px 20px; text-align: center;">
              <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 60px; font-weight: 500;">Nora AI</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              
              <h1 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 28px; font-weight: 600; line-height: 1.3;">${headerText}</h1>
              
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">${mainMessage}</p>
              
              <h2 style="color: #1a1a1a; margin: 0 0 12px 0; font-size: 22px; font-weight: 600;">${data.title}</h2>
              
              <p style="color: #4a5568; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">${data.description}</p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="color: #2d3748; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Session Details</h3>
                    <div style="color: #4a5568; font-size: 16px; line-height: 1.5;">
                      <strong style="color: #2d3748;">Tutor:</strong> ${data.tutorName}<br>
                      <strong style="color: #2d3748;">Date & Time:</strong> ${formattedTime}
                    </div>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.callLink}" style="display: inline-block; background-color: #1661ff; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(22, 97, 255, 0.3);">
                      ${isConfirmation ? "Join When Ready" : "Join Now"}
                    </a>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7fafc; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #718096; font-size: 14px; margin: 0 0 8px 0;">If the button doesn't work, copy this link:</p>
                    <a href="${data.callLink}" style="color: #1661ff; font-size: 14px; word-break: break-all; text-decoration: none;">${data.callLink}</a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f7fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 12px; margin: 0; line-height: 1.5;">
                This email was sent by Nora AI Tutoring System.<br>
                ${isConfirmation ? "You'll receive a reminder 2 minutes before your session." : "Please join your session now for the best experience."}
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

	return {
		html: htmlVersion,
		text: textVersion,
		logoBase64: logoBase64 || undefined,
	};
}
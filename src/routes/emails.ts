import { Router } from "express";
import { sendScheduledEmail } from "../utils/emailSender.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // Send test email to personal email from env
    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
    
    if (!testEmail) {
      return res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: red;">Error</h1>
            <p>TEST_EMAIL not configured in environment variables</p>
          </body>
        </html>
      `);
    }

    // Test both confirmation and reminder emails
    const confirmationSuccess = await sendScheduledEmail(
      testEmail,
      "Advanced Calculus Integration Techniques",
      "Learn integration by parts and substitution methods for complex functions.",
      "https://noratutor.xyz/session/call/s123456789012345",
      new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      "Dr. Sarah Johnson",
      "confirmation"
    );

    const reminderSuccess = await sendScheduledEmail(
      testEmail,
      "Advanced Calculus Integration Techniques",
      "Learn integration by parts and substitution methods for complex functions.",
      "https://noratutor.xyz/session/call/s123456789012345",
      new Date(Date.now() + 1 * 60 * 1000).toISOString(),
      "Dr. Sarah Johnson",
      "reminder"
    );

    if (confirmationSuccess && reminderSuccess) {
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4;">
            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
              <h1 style="color: #28a745; margin-bottom: 20px;">✅ Emails Sent</h1>
              <p style="color: #666; font-size: 16px;">Both confirmation and reminder test emails sent to ${testEmail}</p>
              <p style="color: #999; font-size: 14px; margin-top: 30px;">Reminder now shows 1 minute before session.</p>
            </div>
          </body>
        </html>
      `);
    } else {
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4;">
            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
              <h1 style="color: #dc3545; margin-bottom: 20px;">❌ Email Failed</h1>
              <p style="color: #666; font-size: 16px;">Failed to send test emails. Check server logs for details.</p>
            </div>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error("Error in test email route:", error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: red;">Error</h1>
          <p>Internal server error occurred</p>
        </body>
      </html>
    `);
  }
});

export { router as emailsRouter };
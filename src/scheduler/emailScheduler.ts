// import { supabase } from "../lib/supabase.js";
// // import { sendEmail } from '../utils/emailSender.js';
// import type { ScheduledEmail } from "../types/email.js";

// export function startEmailScheduler() {
// 	// Check for due emails every minute
// 	const interval = setInterval(async () => {
// 		try {
// 			await processScheduledEmails();
// 		} catch (error) {
// 			console.error("Error in email scheduler:", error);
// 		}
// 	}, 60000); // 60 seconds

// 	console.log("Email scheduler started - checking every minute");

// 	// Return cleanup function
// 	return () => {
// 		clearInterval(interval);
// 		console.log("Email scheduler stopped");
// 	};
// }

// async function processScheduledEmails() {
// 	try {
// 		// Get all pending emails that are due
// 		const { data: dueEmails, error } = await supabase
// 			.from("scheduled_emails")
// 			.select("*")
// 			.eq("status", "pending")
// 			.lte("scheduled_at", new Date().toISOString());

// 		if (error) {
// 			console.error("Error fetching due emails:", error);
// 			return;
// 		}

// 		if (!dueEmails || dueEmails.length === 0) {
// 			return;
// 		}

// 		console.log(`Processing ${dueEmails.length} due emails`);

// 		// Process each due email
// 		for (const emailRecord of dueEmails as ScheduledEmail[]) {
// 			try {
// 				// const success = await sendEmail(
// 				//   emailRecord.email,
// 				//   emailRecord.subject,
// 				//   emailRecord.message
// 				// );

// 				// Update status in database
// 			// 	const { error: updateError } = await supabase
// 			// 		.from("scheduled_emails")
// 			// 		.update({
// 			// 			status: success ? "sent" : "failed",
// 			// 			sent_at: new Date().toISOString(),
// 			// 		})
// 			// 		.eq("id", emailRecord.id);

// 			// 	if (updateError) {
// 			// 		console.error("Error updating email status:", updateError);
// 			// 	}
// 			// } catch (error) {
// 			// 	console.error(
// 			// 		`Error processing email ${emailRecord.id}:`,
// 			// 		error
// 			// 	);

// 				// Mark as failed
// 		// 		await supabase
// 		// 			.from("scheduled_emails")
// 		// 			.update({
// 		// 				status: "failed",
// 		// 				sent_at: new Date().toISOString(),
// 		// 			})
// 		// 			.eq("id", emailRecord.id);
// 			// }
// 		// }
// 	// } catch (error) {
// 		// console.error("Error in processScheduledEmails:", error);
// 	}
// }

import { supabase } from "../lib/supabase.js";
import { sendScheduledEmail } from "../utils/emailSender.js";

export function startEmailScheduler() {
	// Check for due sessions every 2 minutes to reduce database load
	const interval = setInterval(async () => {
		try {
			await processScheduledSessions();
		} catch (error) {
			console.error("Error in email scheduler:", error);
		}
	}, 120000); // 2 minutes

	console.log("Email scheduler started - checking every 2 minutes");

	// Return cleanup function
	return () => {
		clearInterval(interval);
		console.log("Email scheduler stopped");
	};
}

async function processScheduledSessions() {
	try {
		// Get sessions that are due in exactly 8-10 minutes (single notification window)
		const now = new Date();
		const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);
		const eightMinutesFromNow = new Date(now.getTime() + 8 * 60000);

		const { data: dueSessions, error } = await supabase
			.from("sessions")
			.select(
				`
        id,
        user_id,
        title,
        description,
        call_link,
        scheduled_time,
        tutor,
        profile!inner(email)
      `
			)
			.eq("status", "SCHEDULED")
			.gte("scheduled_time", eightMinutesFromNow.toISOString())
			.lte("scheduled_time", tenMinutesFromNow.toISOString());

		if (error) {
			console.error("Error fetching due sessions:", error);
			return;
		}

		if (!dueSessions || dueSessions.length === 0) {
			return;
		}

		console.log(`Processing ${dueSessions.length} due sessions`);

		// Process each due session
		for (const session of dueSessions) {
			try {
				const success = await sendScheduledEmail(
					session.profile[0].email,
					session.title,
					session.description,
					session.call_link,
					session.scheduled_time,
					session.tutor
				);

				// Update status to prevent duplicate emails
				const { error: updateError } = await supabase
					.from("sessions")
					.update({
						status: success ? "EMAIL_SENT" : "EMAIL_FAILED",
					})
					.eq("id", session.id);

				if (updateError) {
					console.error(
						"Error updating session status:",
						updateError
					);
				}
			} catch (error) {
				console.error(`Error processing session ${session.id}:`, error);

				// Mark as failed to prevent retries
				await supabase
					.from("sessions")
					.update({ status: "EMAIL_FAILED" })
					.eq("id", session.id);
			}
		}
	} catch (error) {
		console.error("Error in processScheduledSessions:", error);
	}
}
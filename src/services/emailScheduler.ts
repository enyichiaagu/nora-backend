import { supabase } from "../lib/supabase.js";
import { sendScheduledEmail } from "../utils/emailSender.js";

export function startEmailScheduler() {
	// Check for due sessions every minute for 1-minute reminders
	const interval = setInterval(async () => {
		try {
			await processScheduledSessions();
		} catch (error) {
			console.error("Error in email scheduler:", error);
		}
	}, 60000); // 1 minute

	console.log("Email scheduler started - checking every minute for 1-minute reminders");

	// Return cleanup function
	return () => {
		clearInterval(interval);
		console.log("Email scheduler stopped");
	};
}

async function processScheduledSessions() {
	try {
		// Get sessions that are due in exactly 1 minute
		const now = new Date();
		const oneMinuteFromNow = new Date(now.getTime() + 1 * 60000);
		const thirtySecondsFromNow = new Date(now.getTime() + 30000);

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
			.gte("scheduled_time", thirtySecondsFromNow.toISOString())
			.lte("scheduled_time", oneMinuteFromNow.toISOString());

		if (error) {
			console.error("Error fetching due sessions:", error);
			return;
		}

		if (!dueSessions || dueSessions.length === 0) {
			return;
		}

		console.log(`Processing ${dueSessions.length} sessions for 1-minute reminders`);

		// Process each due session
		for (const session of dueSessions) {
			try {
				await sendScheduledEmail(
					session.profile[0].email,
					session.title,
					session.description,
					session.call_link,
					session.scheduled_time,
					session.tutor,
					"reminder"
				);

				console.log(`Reminder email sent for session ${session.id}`);
			} catch (error) {
				console.error(`Error processing session ${session.id}:`, error);
			}
		}
	} catch (error) {
		console.error("Error in processScheduledSessions:", error);
	}
}
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import type { ScheduleEmailRequest } from "../types/email.js";

const router = Router();

router.post("/", async (req, res) => {
	try {
		const { email, scheduledTime }: ScheduleEmailRequest = req.body;

		if (!email || !scheduledTime) {
			return res.status(400).json({
				error: "Email and scheduledTime are required",
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({
				error: "Invalid email format",
			});
		}

		// Validate scheduled time is in the future
		const scheduledDate = new Date(scheduledTime);
		if (scheduledDate <= new Date()) {
			return res.status(400).json({
				error: "Scheduled time must be in the future",
			});
		}

		// Insert into Supabase
		const { data, error } = await supabase
			.from("scheduled_emails")
			.insert({
				email,
				scheduled_at: scheduledDate.toISOString(),
				subject: "Scheduled Reminder from Nora",
				message: "This is your scheduled reminder.",
				status: "pending",
			})
			.select()
			.single();

		if (error) {
			console.error("Error scheduling email:", error);
			return res.status(500).json({
				error: "Failed to schedule email",
			});
		}

		res.json({
			success: true,
			scheduledEmail: {
				id: data.id,
				email: data.email,
				scheduledAt: data.scheduled_at,
				subject: data.subject,
				status: data.status,
			},
		});
	} catch (error) {
		console.error("Error in email scheduler route:", error);
		res.status(500).json({
			error: "Internal server error",
		});
	}
});

export { router as emailSchedulerRouter };

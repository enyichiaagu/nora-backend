import { Router } from "express";
import { nanoid } from "nanoid";
import { supabase } from "../lib/supabase.js";
import { generateTitleAndDescription } from "../utils/geminiHelpers.js";

const router = Router();

router.post("/", async (req, res) => {
	try {
		const {
			userId,
			duration,
			conversation_context,
			tutor,
			replica_id,
			tutor_image,
			personal_id,
			tutor_personality,
			scheduled_time
		} = req.body;

		// Validate required fields
		if (!userId || !duration || !conversation_context || !tutor || !replica_id || 
			!tutor_image || !personal_id || !tutor_personality || !scheduled_time) {
			return res.status(400).json({
				error: "All fields are required: userId, duration, conversation_context, tutor, replica_id, tutor_image, personal_id, tutor_personality, scheduled_time"
			});
		}

		// Validate scheduled_time is in the future
		const scheduledDate = new Date(scheduled_time);
		if (scheduledDate <= new Date()) {
			return res.status(400).json({
				error: "Scheduled time must be in the future"
			});
		}

		// Get user email from profiles table
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("email")
			.eq("id", userId)
			.single();

		if (profileError || !profile) {
			return res.status(404).json({
				error: "User not found"
			});
		}

		if (!profile.email) {
			return res.status(400).json({
				error: "User email not found"
			});
		}

		// Generate title and description
		const { title, description } = await generateTitleAndDescription(conversation_context);

		// Generate call link with 15 character ID
		const sessionId = nanoid(15);
		const call_link = `https://noratutor.xyz/session/call/s${sessionId}`;

		// Insert into sessions table
		const { data: session, error: sessionError } = await supabase
			.from("sessions")
			.insert({
				user_id: userId,
				status: "SCHEDULED",
				scheduled_time: scheduledDate.toISOString(),
				duration,
				context: conversation_context,
				tutor,
				replica_id,
				tutor_image,
				title,
				personal_id,
				description,
				tutor_personality,
				call_link
			})
			.select()
			.single();

		if (sessionError) {
			console.error("Error creating session:", sessionError);
			return res.status(500).json({
				error: "Failed to create session"
			});
		}

		res.json({
			success: true,
			session: {
				id: session.id,
				user_id: session.user_id,
				status: session.status,
				scheduled_time: session.scheduled_time,
				duration: session.duration,
				title: session.title,
				description: session.description,
				call_link: session.call_link
			},
			user_email: profile.email
		});
	} catch (error) {
		console.error("Error in schedules route:", error);
		res.status(500).json({
			error: "Internal server error"
		});
	}
});

export { router as schedulesRouter };
export interface ScheduleEmailRequest {
	email: string;
	scheduledTime: string; // ISO string
	subject?: string;
	message?: string;
}

export interface ScheduledEmail {
	id: string;
	email: string;
	scheduled_at: string;
	subject: string;
	message: string;
	status: "pending" | "sent" | "failed";
	created_at: string;
}

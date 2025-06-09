import { sendEmail } from "../utils/email";

type ReminderOptions = {
  date: Date;
  to: string;
  subject: string;
  html: string;
};

/**
 * Schedules an “H-1” email reminder. In a real app, replace this with
 * a persistent task queue. 
 */
export function scheduleReminder({ date, to, subject, html }: ReminderOptions) {
  // Calculate “one day before date”
  const msUntilReminder = date.getTime() - Date.now() - 24 * 60 * 60 * 1000;
  if (msUntilReminder > 0) {
    setTimeout(async () => {
      try {
        await sendEmail(to, subject, html);
      } catch (err) {
        console.error("Failed to send subscription reminder:", err);
      }
    }, msUntilReminder);
  }
}

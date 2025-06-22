import { sendEmail } from '../email.service';

export const interviewEmailService = {
  sendInterviewScheduled: async (
    email: string,
    firstName: string,
    jobTitle: string,
    companyName: string,
    interviewDate: Date,
    location: string,
    interviewType: string
  ) => {
    const formattedDate = interviewDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Scheduled</h2>
        <p>Hi ${firstName},</p>
        <p>Great news! You have been selected for an interview for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Interview Details:</h3>
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Type:</strong> ${interviewType}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
        <p>Please make sure to be available at the scheduled time. Good luck!</p>
        <p>Best regards,<br>The Job Board Team</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: `Interview Scheduled: ${jobTitle}`,
      html,
      text: `Hi ${firstName}, your interview for ${jobTitle} at ${companyName} is scheduled for ${formattedDate} (${interviewType}) at ${location}.`,
    });
  },

  sendInterviewReminder: async (
    email: string,
    firstName: string,
    jobTitle: string,
    companyName: string,
    interviewDate: Date,
    location: string,
    interviewType: string,
    duration: number,
    notes?: string
  ) => {
    const formattedDate = interviewDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Reminder</h2>
        <p>Hi ${firstName},</p>
        <p>This is a reminder for your upcoming interview for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Interview Details:</h3>
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Duration:</strong> ${duration} minutes</p>
          <p><strong>Type:</strong> ${interviewType}</p>
          <p><strong>Location:</strong> ${location}</p>
          ${notes ? `<p><strong>Additional Notes:</strong> ${notes}</p>` : ''}
        </div>
        <p>Please make sure to be available at the scheduled time. Good luck!</p>
        <p>Best regards,<br>The Job Board Team</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: `Reminder: Interview for ${jobTitle}`,
      html,
      text: `Hi ${firstName}, this is a reminder for your interview for ${jobTitle} at ${companyName} scheduled for ${formattedDate} (${interviewType}) at ${location}.`,
    });
  }
};
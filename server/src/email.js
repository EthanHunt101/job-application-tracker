const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's default sender, usable without verifying your own domain first.
// In that unverified state, Resend only allows sending TO the email address
// the Resend account itself was signed up with - fine for development, but
// worth knowing before expecting a reminder to land in some other inbox.
const FROM = process.env.RESEND_FROM || 'Job Application Tracker <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

async function sendApplicationCreatedEmail({ to, company, role }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Filed: ${role} at ${company}`,
    text: [
      `Your application to ${company} for ${role} has been recorded.`,
      '',
      `We'll email you a weekly check-in on this one until it reaches a final outcome (offer or rejected), so it doesn't fall through the cracks.`,
      '',
      `View it: ${FRONTEND_URL}`,
    ].join('\n'),
  });
}

async function sendWeeklyReminderEmail({ to, company, role, status }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Still open: ${role} at ${company}`,
    text: [
      `Your application to ${company} for ${role} is still marked "${status}".`,
      '',
      `If anything's changed, update its status here: ${FRONTEND_URL}`,
      '',
      `You'll keep getting a weekly reminder like this one until it reaches offer or rejected.`,
    ].join('\n'),
  });
}

module.exports = { sendApplicationCreatedEmail, sendWeeklyReminderEmail };

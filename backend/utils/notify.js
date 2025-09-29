const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

// Helper to send email via Web3Forms
// Requires process.env.WEB3FORMS_KEY to be set (never hardcode secrets)
async function sendEmail({ to, subject, message, fromName = 'Campus Placement Cell', replyTo }) {
  try {
    const accessKey = process.env.WEB3FORMS_KEY;
    if (!accessKey) {
      console.warn('[notify] WEB3FORMS_KEY missing. Skipping email send.');
      return { skipped: true, reason: 'missing_key' };
    }

    const payload = {
      access_key: accessKey,
      subject,
      from_name: fromName,
      // Web3Forms typically sends to configured recipient; we also pass email for context
      email: to,
      message,
    };

    if (replyTo) payload.reply_to = replyTo;

    const res = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('[notify] Web3Forms error:', data || await res.text());
      return { ok: false, status: res.status, data };
    }

    return { ok: true, data };
  } catch (err) {
    console.error('[notify] sendEmail failed:', err);
    return { ok: false, error: String(err) };
  }
}

// Compose a useful message for application status changes
function buildApplicationStatusMessage({ student, internship, status, feedback, interviewDetails, offerDetails }) {
  const lines = [];
  lines.push(`Hello ${student?.name || 'Student'},`);
  lines.push('');
  lines.push(`Your application status for "${internship?.title}" at ${internship?.company} has been updated to: ${status}.`);

  if (status === 'interview_scheduled' && interviewDetails) {
    lines.push('');
    lines.push('Interview Details:');
    if (interviewDetails.date) lines.push(`- Date: ${new Date(interviewDetails.date).toLocaleString()}`);
    if (interviewDetails.mode) lines.push(`- Mode: ${interviewDetails.mode}`);
    if (interviewDetails.location) lines.push(`- Location: ${interviewDetails.location}`);
    if (interviewDetails.meetingLink) lines.push(`- Meeting Link: ${interviewDetails.meetingLink}`);
  }

  if (status === 'offered' && offerDetails) {
    lines.push('');
    lines.push('Offer Details:');
    if (offerDetails.stipend) lines.push(`- Stipend: ${offerDetails.stipend}`);
    if (offerDetails.duration) lines.push(`- Duration: ${offerDetails.duration}`);
    if (offerDetails.startDate) lines.push(`- Start Date: ${new Date(offerDetails.startDate).toDateString()}`);
    if (offerDetails.offerExpiry) lines.push(`- Offer Expiry: ${new Date(offerDetails.offerExpiry).toLocaleString()}`);
  }

  if (feedback) {
    lines.push('');
    lines.push('Feedback:');
    lines.push(feedback);
  }

  lines.push('');
  lines.push('Regards,');
  lines.push('Campus Placement Cell');

  return lines.join('\n');
}

async function notifyApplicationStatusChange({ student, internship, status, feedback, interviewDetails, offerDetails }) {
  if (!student?.email) {
    console.warn('[notify] student email missing, cannot send notification');
    return { skipped: true, reason: 'no_student_email' };
  }

  const subject = `Application ${status.replace(/_/g, ' ')} - ${internship?.title || 'Internship'}`;
  const message = buildApplicationStatusMessage({ student, internship, status, feedback, interviewDetails, offerDetails });

  return sendEmail({ to: student.email, subject, message, replyTo: 'no-reply@campus-portal.local' });
}

module.exports = {
  sendEmail,
  notifyApplicationStatusChange,
};

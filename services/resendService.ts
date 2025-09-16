// NOTE: For this demo, we use a fixed "from" address provided by Resend for testing.
// In a real application, you would use a verified domain.
const RESEND_FROM_EMAIL = 'onboarding@resend.dev';
const RESEND_API_URL = 'https://api.resend.com/emails';

export const sendEmail = async (to: string, subject: string, htmlBody: string) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not set. Simulating successful email send for UI testing.");
    console.log(`Email details:\nTo: ${to}\nSubject: ${subject}\nBody:\n${htmlBody}`);
    return { id: `simulated_${Date.now()}` };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `Storm Notes <${RESEND_FROM_EMAIL}>`,
        to: [to],
        subject: subject,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Resend API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Email sent successfully via Resend:', data);
    return data;

  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to send email. Reason: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while sending the email.');
  }
};
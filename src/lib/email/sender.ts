import { Registration, EventConfig } from '@/types';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export const EmailService = {
  async sendRegistrationReceivedEmail(registration: Registration, event: EventConfig): Promise<boolean> {
    const subject = `Registration Received: ILLUMINATE Workshop [${registration.registrationNumber}]`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0614; color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid #7c3aed40;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #c084fc; margin: 0; font-size: 28px; letter-spacing: 2px;">ILLUMINATE</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">An Initiative of E-Cell, IIT Bombay</p>
        </div>
        
        <p style="font-size: 16px;">Hello <strong>${registration.fullName}</strong>,</p>
        <p style="color: #cbd5e1; line-height: 1.6;">
          Your registration for the 6-hour offline entrepreneurship workshop at <strong>${event.hostInstitution}</strong> has been received.
        </p>

        <div style="background: #150d28; padding: 20px; border-radius: 8px; border-left: 4px solid #9333ea; margin: 24px 0;">
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Registration ID:</strong> <span style="color: #c084fc;">${registration.registrationNumber}</span></p>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Institution:</strong> ${registration.institution}</p>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Course & Year:</strong> ${registration.course} (${registration.yearOfStudy})</p>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Status:</strong> Awaiting Payment Confirmation</p>
          <p style="margin: 4px 0; color: #cbd5e1;"><strong>Fee:</strong> ₹${event.registrationFee}</p>
        </div>

        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">
          Please complete your UPI or gateway payment to confirm your seat and receive your event pass.
        </p>

        <div style="border-top: 1px solid #7c3aed20; margin-top: 28px; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>For questions or assistance: Rachit Kumar (E-Cell IIT Bombay) | +91 9719362033 | rachit@ecell.in</p>
          <p>KMCT College of Engineering for Emerging Technologies and Management, Kasaragod</p>
        </div>
      </div>
    `;

    return this.dispatchEmail(registration.email, subject, html);
  },

  async sendPaymentConfirmationEmail(registration: Registration, event: EventConfig): Promise<boolean> {
    const subject = `Confirmed Seat Pass: ILLUMINATE Workshop [${registration.registrationNumber}]`;
    const venueText = event.venue + (event.roomNumber ? ` (${event.roomNumber})` : '');
    const dateText = event.date || 'To be announced (Coordinators will notify you)';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0614; color: #f8fafc; padding: 32px; border-radius: 12px; border: 1px solid #7c3aed40;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #c084fc; margin: 0; font-size: 32px; letter-spacing: 2px;">ILLUMINATE</h1>
          <p style="color: #a855f7; margin: 4px 0 0 0; font-size: 14px; font-weight: 600;">E-Cell IIT Bombay & KMCT College of Engineering</p>
        </div>
        
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <h2 style="color: #34d399; margin: 0; font-size: 18px;">Payment Verified & Registration Confirmed!</h2>
        </div>

        <p style="font-size: 16px;">Dear <strong>${registration.fullName}</strong>,</p>
        <p style="color: #cbd5e1; line-height: 1.6;">
          Your participation in the <strong>6-hour offline ILLUMINATE Entrepreneurship Workshop</strong> is officially locked in!
        </p>

        <div style="background: #150d28; padding: 20px; border-radius: 8px; border: 1px solid #7c3aed40; margin: 24px 0;">
          <h3 style="color: #e9d5ff; margin-top: 0; font-size: 16px; border-bottom: 1px solid #7c3aed30; padding-bottom: 8px;">Workshop Pass Details</h3>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Pass ID:</strong> <span style="color: #c084fc; font-family: monospace; font-size: 15px;">${registration.registrationNumber}</span></p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Participant:</strong> ${registration.fullName}</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Institution:</strong> ${registration.institution}</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Amount Paid:</strong> ₹${registration.amountPaid || event.registrationFee}</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Date:</strong> ${dateText}</p>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Venue:</strong> ${venueText}</p>
        </div>

        <h4 style="color: #c084fc; margin-bottom: 8px;">What to expect on event day:</h4>
        <ul style="color: #cbd5e1; line-height: 1.7; padding-left: 20px;">
          <li>Collect your physical <strong>Illuminate Startup Kit</strong> at the registration desk.</li>
          <li>Attend 6 hours of interactive workshops and hands-on ideation sprints.</li>
          <li>Receive your official <strong>Certificate from E-Cell IIT Bombay</strong> upon completion.</li>
        </ul>

        <div style="border-top: 1px solid #7c3aed20; margin-top: 28px; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p>Please present this digital pass or your Registration ID at the venue desk.</p>
          <p>E-Cell IIT Bombay Official Contact: Rachit Kumar (+91 9719362033 | rachit@ecell.in)</p>
        </div>
      </div>
    `;

    return this.dispatchEmail(registration.email, subject, html);
  },

  async dispatchEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'ILLUMINATE <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
          }),
        });
        return res.ok;
      } catch (err) {
        console.error('Error dispatching transactional email via Resend:', err);
        return false;
      }
    } else {
      // Local development fallback: Log email output safely
      console.log(`[EmailService DEV MOCK] To: ${to} | Subject: ${subject}`);
      return true;
    }
  },
};

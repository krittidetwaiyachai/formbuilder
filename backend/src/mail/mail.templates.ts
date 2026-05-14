export function getNewSubmissionEmailHtml(formTitle: string, submissionId: string, link: string) {
  return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">New Response Received</h2>
        <p>A new submission has been received for your form <strong>${formTitle}</strong>.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
           <h3 style="margin-top:0;">Submission Details</h3>
           <p><strong>ID:</strong> ${submissionId}</p>
           <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>
            <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
                View Submissions
            </a>
        </p>
      </div>
    `;
}
export function getFormVerificationEmailHtml(formTitle: string, verificationUrl: string) {
  return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">Verify your email</h2>
        <p>You requested verification for the form <strong>${formTitle}</strong>.</p>
        <p>This link expires in 30 minutes.</p>
        <p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p style="word-break: break-all; color: #555;">${verificationUrl}</p>
      </div>
    `;
}
export function getCollaboratorInviteEmailHtml(formTitle: string, acceptUrl: string, inviterLabel: string, displayExpiryDays: number) {
  return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">You've been invited</h2>
        <p><strong>${inviterLabel}</strong> invited you to collaborate on <strong>${formTitle}</strong>.</p>
        <p>This invitation link expires in ${displayExpiryDays} days.</p>
        <p>
          <a href="${acceptUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
            Accept Invitation
          </a>
        </p>
        <p style="word-break: break-all; color: #555;">${acceptUrl}</p>
      </div>
    `;
}
export function getTestEmailHtml() {
  return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">SMTP test succeeded</h2>
        <p>This is a test email from Form Builder admin settings.</p>
        <p style="color: #666;">Sent at: ${new Date().toISOString()}</p>
      </div>
    `;
}
export function getVerificationCodeEmailHtml(title: string, message: string, code: string, expiresInMinutes: number, disclaimer?: string) {
  return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">${title}</h2>
        <p>${message}</p>
        <div style="font-size: 28px; letter-spacing: 6px; font-weight: 700; padding: 12px 16px; background: #f3f4f6; display: inline-block; border-radius: 10px;">
          ${code}
        </div>
        <p style="margin-top: 16px;">This code expires in ${expiresInMinutes} minutes.</p>
        ${disclaimer ? `<p style="color: #666; font-size: 12px;">${disclaimer}</p>` : ''}
      </div>
    `;
}
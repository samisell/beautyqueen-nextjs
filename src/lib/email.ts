import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notify';

// ──────────────────────────────────────────────
// SMTP Transport (singleton, lazy-init)
// ──────────────────────────────────────────────

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[Email] SMTP not configured — emails will be logged but not sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

// ──────────────────────────────────────────────
// OTP Generation
// ──────────────────────────────────────────────

export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * digits.length)];
  return otp;
}

// ──────────────────────────────────────────────
// Email Templates
// ──────────────────────────────────────────────

function emailBaseHTML(title: string, bodyHTML: string): string {
  const appName = process.env.APP_NAME || 'Beauty Vote';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">${appName}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHTML}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;">
                &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.<br>
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const templates: Record<string, (data: Record<string, string>) => { subject: string; html: string }> = {
  welcome: (data) => ({
    subject: `Welcome to ${process.env.APP_NAME || 'Beauty Vote'}! 🎉`,
    html: emailBaseHTML('Welcome!', `
      <h2 style="margin:0 0 16px;color:#111827;">Welcome aboard, ${data.name}! 🎉</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        We're excited to have you join the ${process.env.APP_NAME || 'Beauty Vote'} community. Get ready to support your favorite contestants and participate in thrilling beauty competitions!
      </p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:16px 0;">
        <h3 style="margin:0 0 8px;color:#9a3412;">Quick Start Guide</h3>
        <ol style="color:#374151;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
          <li><strong>Browse</strong> — Check out active contestants on the leaderboard</li>
          <li><strong>Vote</strong> — Use your 3 free daily votes per contestant</li>
          <li><strong>Buy Votes</strong> — Purchase additional votes for more support</li>
          <li><strong>Refer</strong> — Share your referral code to earn bonus votes</li>
          <li><strong>Win</strong> — Follow tournaments and cheer on your favorites!</li>
        </ol>
      </div>
      <p style="color:#374151;font-size:14px;margin:0;">
        If you have any questions, feel free to reach out to our support team.
      </p>
    `),
  }),

  emailVerification: (data) => ({
    subject: `Verify Your Email — OTP: ${data.otp}`,
    html: emailBaseHTML('Email Verification', `
      <h2 style="margin:0 0 16px;color:#111827;">Verify Your Email Address</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${data.name}, please use the following OTP to verify your email address:
      </p>
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;background:#fff7ed;border:2px dashed #f97316;border-radius:12px;padding:16px 32px;">
          <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#ea580c;">${data.otp}</span>
        </div>
      </div>
      <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">
        This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.
      </p>
      <p style="color:#6b7280;font-size:13px;margin:0;">
        If you did not request this verification, please ignore this email.
      </p>
    `),
  }),

  loginNotification: (data) => ({
    subject: `New Login to Your ${process.env.APP_NAME || 'Beauty Vote'} Account`,
    html: emailBaseHTML('Login Notification', `
      <h2 style="margin:0 0 16px;color:#111827;">New Login Detected 🔐</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${data.name}, a new login was detected on your account.
      </p>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:16px 0;">
        <table style="width:100%;font-size:14px;color:#374151;">
          <tr><td style="padding:4px 0;"><strong>Device/IP:</strong></td><td>${data.ip || 'Unknown'}</td></tr>
          <tr><td style="padding:4px 0;"><strong>Time:</strong></td><td>${data.time || 'Unknown'}</td></tr>
          <tr><td style="padding:4px 0;"><strong>Location:</strong></td><td>${data.location || 'Unknown'}</td></tr>
        </table>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0;">
        If this wasn't you, please secure your account immediately by changing your password.
      </p>
    `),
  }),

  registrationConfirmation: (data) => ({
    subject: `Registration Successful — ${process.env.APP_NAME || 'Beauty Vote'}`,
    html: emailBaseHTML('Registration Successful', `
      <h2 style="margin:0 0 16px;color:#111827;">Registration Complete! ✅</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Welcome, ${data.name}! Your account has been created successfully.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="color:#166534;font-size:14px;margin:0;">
          <strong>Account Details:</strong><br>
          Email: ${data.email}<br>
          Referral Code: <code style="background:#dcfce7;padding:2px 8px;border-radius:4px;">${data.referralCode}</code>
        </p>
      </div>
      <p style="color:#374151;font-size:14px;margin:0 0 16px;">
        Please verify your email address to unlock all features.
      </p>
    `),
  }),

  platformInstructions: (data) => ({
    subject: `How to Use ${process.env.APP_NAME || 'Beauty Vote'} — Complete Guide 📖`,
    html: emailBaseHTML('Platform Instructions', `
      <h2 style="margin:0 0 16px;color:#111827;">Getting Started Guide 📖</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${data.name}, here's everything you need to know about using ${process.env.APP_NAME || 'Beauty Vote'}.
      </p>
      <div style="space-y:12px;">
        <div style="background:#fff7ed;border-radius:12px;padding:16px;margin-bottom:12px;">
          <h3 style="margin:0 0 8px;color:#9a3412;">🗳️ How Voting Works</h3>
          <ul style="color:#374151;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
            <li>Every registered user gets <strong>3 free votes</strong> per contestant daily</li>
            <li>Buy additional votes from the <strong>Packages</strong> section</li>
            <li>Refer friends to earn <strong>5 bonus votes</strong> per referral</li>
          </ul>
        </div>
        <div style="background:#eff6ff;border-radius:12px;padding:16px;margin-bottom:12px;">
          <h3 style="margin:0 0 8px;color:#1e40af;">🏆 Tournament System</h3>
          <ul style="color:#374151;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
            <li>Contestants compete through multiple <strong>stages</strong></li>
            <li>Contestants need minimum votes to <strong>advance</strong> to the next stage</li>
            <li>Below-threshold contestants are <strong>automatically eliminated</strong> when a stage ends</li>
            <li>The final stage determines the <strong>winner</strong></li>
          </ul>
        </div>
        <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin-bottom:12px;">
          <h3 style="margin:0 0 8px;color:#166534;">💰 Purchasing Votes</h3>
          <ul style="color:#374151;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
            <li>Go to <strong>Dashboard → Purchases</strong></li>
            <li>Choose a vote package and payment method</li>
            <li>Online payments are credited <strong>instantly</strong></li>
            <li>Offline payments require <strong>admin approval</strong></li>
          </ul>
        </div>
      </div>
    `),
  }),

  passwordReset: (data) => ({
    subject: `Password Reset — OTP: ${data.otp}`,
    html: emailBaseHTML('Password Reset', `
      <h2 style="margin:0 0 16px;color:#111827;">Reset Your Password</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${data.name}, use this OTP to reset your password:
      </p>
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;background:#fef2f2;border:2px dashed #ef4444;border-radius:12px;padding:16px 32px;">
          <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#dc2626;">${data.otp}</span>
        </div>
      </div>
      <p style="color:#6b7280;font-size:14px;margin:0;">
        This OTP expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.
      </p>
    `),
  }),

  contestantEliminated: (data) => ({
    subject: `Tournament Update — Stage Results`,
    html: emailBaseHTML('Tournament Update', `
      <h2 style="margin:0 0 16px;color:#111827;">Tournament Stage Update 📋</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${data.name}, the <strong>${data.stageName}</strong> stage has ended.
      </p>
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="color:#374151;font-size:14px;margin:0;">
          You can enroll in new upcoming tournaments from your dashboard. Stay tuned for more opportunities!
        </p>
      </div>
    `),
  }),

  paymentSuccessful: (data) => ({
    subject: `Payment Confirmed — ${data.votes} Votes Credited! 🎉`,
    html: emailBaseHTML('Payment Successful', `
      <h2 style="margin:0 0 16px;color:#111827;">Payment Confirmed! 🎉</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${data.name}, your payment has been verified successfully.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
        <table style="width:100%;font-size:14px;color:#374151;">
          <tr><td style="padding:6px 0;"><strong>Package:</strong></td><td>${data.packageName}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Votes Credited:</strong></td><td>${data.votes} votes</td></tr>
          <tr><td style="padding:6px 0;"><strong>Amount:</strong></td><td>${data.amount}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Method:</strong></td><td>${data.method}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Reference:</strong></td><td><code style="background:#dcfce7;padding:2px 6px;border-radius:4px;">${data.reference || 'N/A'}</code></td></tr>
        </table>
      </div>
      <p style="color:#374151;font-size:14px;margin:0 0 16px;">
        Your votes are now available in your dashboard. Start voting for your favorite contestants!
      </p>
      <p style="color:#6b7280;font-size:13px;margin:0;">
        If you did not make this payment, please contact support immediately.
      </p>
    `),
  }),

  paymentApproved: (data) => ({
    subject: `Payment Approved — ${data.votes} Votes Credited! ✅`,
    html: emailBaseHTML('Payment Approved', `
      <h2 style="margin:0 0 16px;color:#111827;">Offline Payment Approved! ✅</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${data.name}, your offline payment has been reviewed and approved by our admin team.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
        <table style="width:100%;font-size:14px;color:#374151;">
          <tr><td style="padding:6px 0;"><strong>Package:</strong></td><td>${data.packageName}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Votes Credited:</strong></td><td>${data.votes} votes</td></tr>
          <tr><td style="padding:6px 0;"><strong>Amount:</strong></td><td>${data.amount}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Reference:</strong></td><td><code style="background:#dcfce7;padding:2px 6px;border-radius:4px;">${data.reference || 'N/A'}</code></td></tr>
        </table>
      </div>
      <p style="color:#374151;font-size:14px;margin:0;">
        Your votes are now available. Head to your dashboard to start voting!
      </p>
    `),
  }),

  paymentRejected: (data) => ({
    subject: `Payment Not Approved — Action Required`,
    html: emailBaseHTML('Payment Rejected', `
      <h2 style="margin:0 0 16px;color:#111827;">Payment Not Approved ❌</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Hi ${data.name}, your payment was not approved by our admin team.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;">
        <table style="width:100%;font-size:14px;color:#374151;">
          <tr><td style="padding:6px 0;"><strong>Package:</strong></td><td>${data.packageName}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Amount:</strong></td><td>${data.amount}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Reference:</strong></td><td><code style="background:#fee2e2;padding:2px 6px;border-radius:4px;">${data.reference || 'N/A'}</code></td></tr>
          <tr><td style="padding:6px 0;"><strong>Reason:</strong></td><td>${data.reason}</td></tr>
        </table>
      </div>
      <p style="color:#374151;font-size:14px;margin:0 0 16px;">
        No votes were credited for this payment. If you believe this is an error, please contact our support team with your payment reference for review.
      </p>
    `),
  }),

  tournamentJoined: (data) => ({
    subject: `You're In! Welcome to ${data.tournamentName} 🌟`,
    html: emailBaseHTML('Tournament Registration Confirmed', `
      <h2 style="margin:0 0 16px;color:#111827;">You're Officially a Contestant! 🌟</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Congratulations, <strong>${data.name}</strong>! You have successfully joined the <strong>${data.tournamentName}</strong> competition.
      </p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:16px 0;">
        <h3 style="margin:0 0 12px;color:#9a3412;">Your Contestant Details</h3>
        <table style="width:100%;font-size:14px;color:#374151;">
          <tr><td style="padding:6px 0;"><strong>Contestant ID:</strong></td><td><code style="background:#dcfce7;padding:2px 8px;border-radius:4px;font-weight:700;">${data.contestantId}</code></td></tr>
          <tr><td style="padding:6px 0;"><strong>Tournament:</strong></td><td>${data.tournamentName}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Stage:</strong></td><td>${data.stageName}</td></tr>
        </table>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
        <h3 style="margin:0 0 8px;color:#166534;">🚀 Share Your Profile & Get More Votes!</h3>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 8px;">
          The more people know about you, the more votes you'll get! Share your contestant profile link with friends, family, and on social media to boost your chances of winning.
        </p>
        <p style="color:#374151;font-size:14px;margin:0;">
          <strong>Tips:</strong> Ask your supporters to vote daily, share your contestant ID, and encourage them to purchase vote packages for extra support!
        </p>
      </div>
      <p style="color:#374151;font-size:14px;margin:0 0 16px;">
        Log in to your dashboard to track your votes, view the leaderboard, and manage your contestant profile.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
          Go to Your Dashboard →
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0;">
        Good luck in the competition! 🏆
      </p>
    `),
  }),

  paymentFraudWarning: (data) => ({
    subject: `⚠️ Warning: Fraudulent Payment Detected — Your Account Is At Risk`,
    html: emailBaseHTML('Fraud Warning', `
      <h2 style="margin:0 0 16px;color:#dc2626;">⚠️ Fraudulent Activity Detected</h2>
      <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
        Dear ${data.name}, our admin team has identified your recent payment as <strong style="color:#dc2626;">fraudulent</strong>.
      </p>
      <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:12px;padding:20px;margin:16px 0;">
        <h3 style="margin:0 0 12px;color:#991b1b;font-size:16px;">⚠️ Payment Details</h3>
        <table style="width:100%;font-size:14px;color:#374151;">
          <tr><td style="padding:6px 0;"><strong>Package:</strong></td><td>${data.packageName}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Amount:</strong></td><td>${data.amount}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Reference:</strong></td><td>${data.reference || 'N/A'}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Votes Removed:</strong></td><td style="color:#dc2626;font-weight:700;">${data.votesRemoved} votes</td></tr>
          <tr><td style="padding:6px 0;"><strong>Reason:</strong></td><td>${data.reason}</td></tr>
        </table>
      </div>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin:16px 0;">
        <h3 style="margin:0 0 8px;color:#92400e;font-size:14px;">🚨 Disqualification Warning</h3>
        <p style="color:#92400e;font-size:14px;line-height:1.6;margin:0;">
          All votes associated with this payment have been <strong>removed</strong>. Continued fraudulent activity will result in <strong>permanent disqualification</strong> from all tournaments and possible account suspension.
        </p>
      </div>
      <p style="color:#374151;font-size:14px;margin:0 0 16px;">
        If you believe this is a mistake, please contact our support team immediately with proof of legitimate payment.
      </p>
      <p style="color:#6b7280;font-size:13px;margin:0;">
        This is a serious warning. Further violations may lead to permanent account termination.
      </p>
    `),
  }),
};

// ──────────────────────────────────────────────
// Send Email
// ──────────────────────────────────────────────

export interface SendEmailOptions {
  to: string;
  template: string;
  data: Record<string, string>;
  userId?: string;
}

export async function sendEmail({ to, template, data, userId }: SendEmailOptions): Promise<boolean> {
  const tmpl = templates[template];
  if (!tmpl) {
    console.error(`[Email] Unknown template: ${template}`);
    return false;
  }

  const { subject, html } = tmpl(data);
  const from = process.env.EMAIL_FROM || `${process.env.APP_NAME || 'Beauty Vote'} <noreply@beautyvote.com>`;

  // Log the email attempt
  let logId: string | undefined;

  try {
    const log = await db.emailLog.create({
      data: {
        userId: userId || null,
        to,
        subject,
        template,
        status: 'sending',
        data: JSON.stringify(data),
      },
    });
    logId = log.id;
  } catch (logErr) {
    console.error('[Email] Failed to create email log:', logErr);
  }

  // Try to send via SMTP
  const transport = getTransporter();

  if (transport) {
    try {
      await transport.sendMail({ from, to, subject, html });
      if (logId) {
        await db.emailLog.update({ where: { id: logId }, data: { status: 'sent' } });
      }
      console.log(`[Email] Sent "${template}" to ${to}`);
      return true;
    } catch (sendErr) {
      const errMsg = sendErr instanceof Error ? sendErr.message : 'Unknown error';
      console.error(`[Email] Failed to send to ${to}:`, errMsg);
      if (logId) {
        await db.emailLog.update({ where: { id: logId }, data: { status: 'failed', error: errMsg } });
      }
      return false;
    }
  }

  // No SMTP configured — mark as logged (dev mode)
  console.log(`[Email] [DEV MODE] Template: ${template} | To: ${to} | Subject: ${subject}`);
  console.log(`[Email] [DEV MODE] Data:`, JSON.stringify(data));
  if (logId) {
    await db.emailLog.update({ where: { id: logId }, data: { status: 'logged' } });
  }
  return false;
}

// ──────────────────────────────────────────────
// Convenience functions
// ──────────────────────────────────────────────

export async function sendWelcomeEmail(userId: string, name: string, email: string) {
  const tmpl = templates['welcome'];
  const { subject, html } = tmpl({ name });
  createNotification(userId, subject, `Welcome to the platform! Your account has been created successfully.`, 'success', html).catch(() => {});
  return sendEmail({ to: email, template: 'welcome', data: { name }, userId });
}

export async function sendRegistrationEmail(userId: string, name: string, email: string, referralCode: string) {
  const tmpl = templates['registrationConfirmation'];
  const { subject, html } = tmpl({ name, email, referralCode });
  createNotification(userId, subject, `Registration complete! Your referral code is ${referralCode}. Verify your email to unlock all features.`, 'success', html).catch(() => {});
  return sendEmail({ to: email, template: 'registrationConfirmation', data: { name, email, referralCode }, userId });
}

export async function sendVerificationOTP(userId: string, name: string, email: string, otp: string) {
  const tmpl = templates['emailVerification'];
  const { subject, html } = tmpl({ name, otp });
  createNotification(userId, subject, `Your email verification OTP is ${otp}. It expires in 10 minutes.`, 'info', html).catch(() => {});
  return sendEmail({ to: email, template: 'emailVerification', data: { name, otp }, userId });
}

export async function sendLoginNotification(userId: string, name: string, email: string, ip: string) {
  const time = new Date().toISOString();
  const tmpl = templates['loginNotification'];
  const { subject, html } = tmpl({ name, ip, time, location: 'Unknown' });
  createNotification(userId, subject, `A new login was detected from IP ${ip} at ${time}. If this wasn't you, secure your account immediately.`, 'warning', html).catch(() => {});
  return sendEmail({ to: email, template: 'loginNotification', data: { name, ip, time, location: 'Unknown' }, userId });
}

export async function sendPlatformInstructions(userId: string, name: string, email: string) {
  const tmpl = templates['platformInstructions'];
  const { subject, html } = tmpl({ name });
  createNotification(userId, subject, `Here's your complete guide on how to use the platform — voting, tournaments, and purchasing votes.`, 'info', html).catch(() => {});
  return sendEmail({ to: email, template: 'platformInstructions', data: { name }, userId });
}

export async function sendPasswordResetOTP(userId: string, name: string, email: string, otp: string) {
  return sendEmail({ to: email, template: 'passwordReset', data: { name, otp }, userId });
}

export async function sendPaymentSuccessfulEmail(
  userId: string, name: string, email: string,
  data: { packageName: string; votes: string; amount: string; method: string; reference: string }
) {
  const tmpl = templates['paymentSuccessful'];
  const { subject, html } = tmpl({ name, ...data });
  createNotification(userId, subject, `Your payment of ${data.amount} for ${data.packageName} (${data.votes} votes) has been confirmed. Votes are now available!`, 'success', html).catch(() => {});
  return sendEmail({ to: email, template: 'paymentSuccessful', data: { name, ...data }, userId });
}

export async function sendPaymentApprovedEmail(
  userId: string, name: string, email: string,
  data: { packageName: string; votes: string; amount: string; reference: string }
) {
  const tmpl = templates['paymentApproved'];
  const { subject, html } = tmpl({ name, ...data });
  createNotification(userId, subject, `Your offline payment of ${data.amount} for ${data.packageName} (${data.votes} votes) has been approved. Votes are now available!`, 'success', html).catch(() => {});
  return sendEmail({ to: email, template: 'paymentApproved', data: { name, ...data }, userId });
}

export async function sendPaymentRejectedEmail(
  userId: string, name: string, email: string,
  data: { packageName: string; amount: string; reference: string; reason: string }
) {
  const tmpl = templates['paymentRejected'];
  const { subject, html } = tmpl({ name, ...data });
  createNotification(userId, subject, `Your payment of ${data.amount} for ${data.packageName} was not approved. Reason: ${data.reason}`, 'error', html).catch(() => {});
  return sendEmail({ to: email, template: 'paymentRejected', data: { name, ...data }, userId });
}

export async function sendFraudWarningEmail(
  userId: string, name: string, email: string,
  data: { packageName: string; amount: string; reference: string; reason: string; votesRemoved: string }
) {
  const tmpl = templates['paymentFraudWarning'];
  const { subject, html } = tmpl({ name, ...data });
  createNotification(userId, subject, `Fraudulent payment detected for ${data.packageName} (${data.amount}). ${data.votesRemoved} votes removed. Continued violations may lead to disqualification.`, 'error', html).catch(() => {});
  return sendEmail({ to: email, template: 'paymentFraudWarning', data: { name, ...data }, userId });
}

export async function sendTournamentJoinedEmail(
  userId: string, name: string, email: string,
  data: { tournamentName: string; stageName: string; contestantId: string }
) {
  const tmpl = templates['tournamentJoined'];
  const { subject, html } = tmpl({ name, ...data });
  createNotification(userId, subject, `You have successfully joined ${data.tournamentName} (${data.stageName})! Share your profile to get more votes.`, 'success', html).catch(() => {});
  return sendEmail({ to: email, template: 'tournamentJoined', data: { name, ...data }, userId });
}

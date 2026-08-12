import nodemailer from "nodemailer";
import { getEmail } from "./imap.methods.js";

// Send Email Method
export const sendEmail = async (userData, { to, subject, text }) => {
  const smtpUser = userData.smtp?.auth?.user || userData.smtp?.username || userData.smtp?.user;
  const smtpPass = userData.smtp?.auth?.pass || userData.smtp?.password || userData.smtp?.pass;
  const port = Number(userData.smtp?.port) || 587;
  const isSecure = port === 465;

  if (!smtpUser || !smtpPass) {
    return {
      success: false,
      message: "Missing SMTP credentials. Please configure your email account SMTP password (or App Password) in Connected Accounts settings.",
    };
  }

  // Create SMTP Transporter
  const transporter = nodemailer.createTransport({
    host: userData.smtp?.host || "smtp.gmail.com",
    port,
    secure: isSecure,
    requireTLS: !isSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Email Options
    const mailOptions = {
      from: smtpUser,
      to,
      subject,
      text,
    };

    // Send Email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
    };
  } catch (error) {
    console.error("SMTP ERROR:", error.message);

    return {
      success: false,
      message: error.message,
    };
  }
};

// Forward Email Method
export const forwardEmail = async (
  userData,
  { emailId, to, comment = "", mailbox = "INBOX" }
) => {
  // Fetch original email via IMAP
  const original = await getEmail(userData, emailId, mailbox);

  if (!original.success || !original.data) {
    return {
      success: false,
      message: original.message || "Failed to fetch original email for forwarding"
    };
  }

  const originalEmail = original.data;
  const fwdSubject = originalEmail.subject?.startsWith("Fwd:")
    ? originalEmail.subject
    : `Fwd: ${originalEmail.subject || ""}`;

  const senderText =
    typeof originalEmail.from === "object"
      ? originalEmail.from?.text || originalEmail.from?.address || JSON.stringify(originalEmail.from)
      : originalEmail.from || "Unknown";

  const forwardText = [
    comment ? `${comment}\n\n` : "",
    "---------- Forwarded message ---------",
    `From: ${senderText}`,
    `Date: ${originalEmail.date || ""}`,
    `Subject: ${originalEmail.subject || ""}`,
    `To: ${Array.isArray(originalEmail.to) ? originalEmail.to.join(", ") : originalEmail.to || ""}`,
    "\n",
    originalEmail.body || originalEmail.snippet || "",
  ].join("\n");

  return await sendEmail(userData, {
    to,
    subject: fwdSubject,
    text: forwardText
  });
};
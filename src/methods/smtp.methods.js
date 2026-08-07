import nodemailer from "nodemailer";
import { getEmail } from "./imap.methods.js";

// Send Email Method
export const sendEmail = async (userData, { to, subject, text }) => {

  // Create SMTP Transporter
  const transporter = nodemailer.createTransport({
    host: userData.smtp.host,
    port: Number(userData.smtp.port),
    secure: userData.smtp.secure,
    auth: {
      user: userData.smtp.auth.user,
      pass: userData.smtp.auth.pass
    }
  });

  try {

    // Email Options
    const mailOptions = {
      from: userData.smtp.auth.user,
      to,
      subject,
      text
    };

    // Send Email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted
    };

  } catch (error) {

    console.error("SMTP ERROR:", error.message);

    return {
      success: false,
      message: error.message
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

  const forwardText = [
    comment ? `${comment}\n\n` : "",
    "---------- Forwarded message ---------",
    `From: ${originalEmail.from || "Unknown"}`,
    `Date: ${originalEmail.date || ""}`,
    `Subject: ${originalEmail.subject || ""}`,
    `To: ${Array.isArray(originalEmail.to) ? originalEmail.to.join(", ") : originalEmail.to || ""}`,
    "\n",
    originalEmail.body || ""
  ].join("\n");

  return await sendEmail(userData, {
    to,
    subject: fwdSubject,
    text: forwardText
  });
};
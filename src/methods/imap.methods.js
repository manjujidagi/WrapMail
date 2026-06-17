import dotenv from "dotenv";
import { ImapFlow } from "imapflow";

dotenv.config({
  path: ".env"
});

// Create IMAP Client
const client = new ImapFlow({
  host: process.env.IMAP_HOST,
  port: Number(process.env.IMAP_PORT),
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Fetch Inbox Emails
export const getInboxEmails = async () => {

  try {

    // Connect
    await client.connect();

    // Lock Inbox
    const lock = await client.getMailboxLock("INBOX");

    try {

      const emails = [];

      // Fetch latest emails
      for await (const message of client.fetch("1:*", {
        envelope: true
      })) {

        emails.push({
          from: message.envelope.from[0].address,
          subject: message.envelope.subject,
          date: message.envelope.date
        });

      }

      // Latest first
      emails.reverse();

      return {
        success: true,
        count: emails.length,
        emails
      };

    } finally {

      lock.release();

    }

  } catch (error) {

    console.error("IMAP ERROR:", error.message);

    return {
      success: false,
      message: error.message
    };

  } finally {

    await client.logout();

  }

};
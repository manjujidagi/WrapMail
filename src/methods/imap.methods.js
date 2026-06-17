import { ImapFlow } from "imapflow";

// Fetch Emails
export const getEmails = async (userData, mailbox = "INBOX") => {
  // Create IMAP Client
  const client = new ImapFlow({
    host: userData.imap.host,
    port: Number(userData.imap.port),
    secure: userData.imap.secure,
    auth: {
      user: userData.imap.auth.user,
      pass: userData.imap.auth.pass
    }
  });

  try {
    // Connect
    await client.connect();

    // Lock Mailbox
    const lock = await client.getMailboxLock(mailbox);

    try {
      // Open mailbox to get total number of emails
      const mailboxInfo = await client.mailboxOpen(mailbox);

      // Fetch emails
      const start = Math.max(1, mailboxInfo.exists - 9);

      const emails = [];

      for await (const message of client.fetch(`${start}:*`, {
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
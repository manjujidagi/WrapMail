import { ImapFlow } from "imapflow";

// Fetch Inbox Emails
export const getInboxEmails = async (userData) => {

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
    // Lock Inbox
    const lock = await client.getMailboxLock("INBOX");

    try {
      const emails = [];

      // Fetch latest emails
      for await (const message of client.fetch("1:*", {
        envelope: true
      })) {import { ImapFlow } from "imapflow";

// Fetch Inbox Emails
export const getInboxEmails = async (userData) => {

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

    // Lock Inbox
    const lock = await client.getMailboxLock("INBOX");

    try {
      // Open mailbox to get total number of emails
      const mailbox = await client.mailboxOpen("INBOX");

      // Calculate starting message number (last 10 emails)
      const start = Math.max(1, mailbox.exists - 9);

      const emails = [];

      // Fetch only the latest 10 emails
      for await (const message of client.fetch(`${start}:*`, {
        envelope: true
      })) {
        emails.push({
          from: message.envelope.from[0].address,
          subject: message.envelope.subject,
          date: message.envelope.date
        });
      }

      // Show newest email first
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
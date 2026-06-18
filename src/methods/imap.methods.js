import { ImapFlow } from "imapflow";

// Fetch Emails
export const getEmails = async (userData, query = {}) => {
  const {
    mailbox = "INBOX",
    page = 1,
    limit = 10
  } = query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

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
      // Open mailbox
      const mailboxInfo = await client.mailboxOpen(mailbox);

      // Pagination
      const start = (pageNumber - 1) * limitNumber + 1;
      const end = Math.min(start + limitNumber - 1, mailboxInfo.exists);

      const emails = [];

      // Fetch requested page
      for await (const message of client.fetch(`${start}:${end}`, {
        envelope: true
      })) {
        emails.push({
          from: message.envelope.from[0].address,
          subject: message.envelope.subject,
          date: message.envelope.date
        });
      }

      return {
        success: true,
        page: pageNumber,
        limit: limitNumber,
        total: mailboxInfo.exists,
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
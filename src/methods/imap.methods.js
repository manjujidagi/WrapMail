import { ImapFlow } from "imapflow";

export const getEmails = async (userData, query = {}) => {
  const {
    mailbox = "INBOX",
    page = 1,
    limit = 10
  } = query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.max(1, Number(limit));

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
    await client.connect();

    const lock = await client.getMailboxLock(mailbox);

    try {
      const mailboxInfo = await client.mailboxOpen(mailbox);

      const total = mailboxInfo.exists;

      if (total === 0) {
        return {
          success: true,
          page: pageNumber,
          limit: limitNumber,
          total,
          count: 0,
          emails: []
        };
      }

      // Calculate sequence numbers for newest-first pagination
      const end = total - (pageNumber - 1) * limitNumber;
      const start = Math.max(1, end - limitNumber + 1);

      if (end < 1) {
        return {
          success: true,
          page: pageNumber,
          limit: limitNumber,
          total,
          count: 0,
          emails: []
        };
      }

      const emails = [];

      for await (const message of client.fetch(`${start}:${end}`, {
        envelope: true
      })) {
        emails.push({
          from: message.envelope.from?.[0]?.address,
          subject: message.envelope.subject,
          date: message.envelope.date
        });
      }

      // Return newest emails first
      emails.reverse();

      return {
        success: true,
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
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
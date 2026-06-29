import { ImapFlow } from "imapflow";

// Fetch Emails
export const getEmails = async (userData, query = {}) => {
  const {
    mailbox = "INBOX",
    page = 1,
    limit = 10
  } = query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.max(1, Number(limit));

  // Create IMAP client
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
    // Connect to IMAP server
    await client.connect();

    // Lock mailbox
    const lock = await client.getMailboxLock(mailbox);

    try {
      // Open mailbox
      const mailboxInfo = await client.mailboxOpen(mailbox);

      const total = mailboxInfo.exists;

      // Return empty response if mailbox has no emails
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

      // Requested page exceeds available emails
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

      // Fetch emails from calculated sequence range
      for await (const message of client.fetch(`${start}:${end}`, {
        uid: true, // NEW: Fetch UID
        envelope: true
      })) {
        emails.push({
          id: message.uid, // NEW: Return UID
          from: message.envelope.from?.[0]?.address,
          subject: message.envelope.subject,
          date: message.envelope.date
        });
      }

      // Fetch returns oldest → newest
      // Reverse to return newest → oldest
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
    if (client.usable) {
      await client.logout();
    }
  }
};

// =======================================================
// Fetch Individual Email Details by UID
// =======================================================

export const getEmail = async (
  userData,
  emailId,
  mailbox = "INBOX"
) => {
  // Create IMAP client
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
    // Connect to IMAP server
    await client.connect();

    // Lock selected mailbox
    const lock = await client.getMailboxLock(mailbox);

    try {
      // Open selected mailbox
      await client.mailboxOpen(mailbox);

      // Fetch email by UID
      const message = await client.fetchOne(
        emailId,
        {
          envelope: true,
          source: true
        },
        {
          uid: true
        }
      );

      // Email not found
      if (!message) {
        return {
          success: false,
          message: "Email not found",
          data: null
        };
      }

      return {
        success: true,
        message: "Email fetched successfully",
        data: {
          id: message.uid,
          from: message.envelope.from?.[0]?.address,
          to: message.envelope.to?.map(user => user.address),
          subject: message.envelope.subject,
          date: message.envelope.date,
          body: message.source.toString()
        }
      };
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error("IMAP ERROR:", error.message);

    return {
      success: false,
      message: error.message,
      data: null
    };
  } finally {
    // Logout only if client is connected
    if (client.usable) {
      await client.logout();
    }
  }
};

// =======================================================
// Fetch Email Attachments by UID
// =======================================================

export const getAttachments = async (
  userData,
  emailId,
  mailbox = "INBOX"
) => {
  // Create IMAP client
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
    // Connect to IMAP server
    await client.connect();

    // Lock selected mailbox
    const lock = await client.getMailboxLock(mailbox);

    try {
      // Open selected mailbox
      await client.mailboxOpen(mailbox);

      // Fetch email body structure by UID
      const message = await client.fetchOne(
        emailId,
        {
          bodyStructure: true
        },
        {
          uid: true
        }
      );

      // Email not found
      if (!message) {
        return {
          success: false,
          message: "Email not found",
          data: null
        };
      }

      const attachments = [];

      // Recursively traverse the body structure
      const extractAttachments = (node) => {
        if (!node) {
          return;
        }

        // If the current node is an attachment, collect its details
        if (node.disposition === "attachment") {
          attachments.push({
            id: node.part,
            filename:
              node.dispositionParameters?.filename ||
              node.parameters?.name ||
              "unknown",
            contentType: node.type,
            size: node.size
          });
        }

        // Process child nodes recursively
        if (node.childNodes?.length) {
          for (const child of node.childNodes) {
            extractAttachments(child);
          }
        }
      };

      // Start traversal from the root body structure
      extractAttachments(message.bodyStructure);
      
      if (attachments.length === 0) {
        return {
          success: true,
          message: "No attachments found",
          data: []
        };
      }
      return {
        success: true,
        message: "Attachments fetched successfully",
        data: attachments
      };
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error("IMAP ERROR:", error.message);

    return {
      success: false,
      message: error.message,
      data: null
    };
  } finally {
    if (client.usable) {
      await client.logout();
    }
  }
};
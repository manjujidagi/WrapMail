import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

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
  const client = new ImapFlow(userData.imap);

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
    auth: userData.imap.auth || {
      user: userData.imap.username,
      pass: userData.imap.password
    }
  });

  client.on("error", (err) => {
    console.error("IMAP Connection Error:", err.message);
  });

  try {
    // Connect to IMAP server
    await client.connect();

    // Lock selected mailbox
    const lock = await client.getMailboxLock(mailbox);

    try {

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

      let cleanBody = "";
      if (message.source) {
        try {
          const parsed = await simpleParser(message.source);
          cleanBody = (parsed.text || "").trim();
          if (!cleanBody && parsed.html) {
            cleanBody = parsed.html
              .replace(/<style[\s\S]*?<\/style>/gi, "")
              .replace(/<script[\s\S]*?<\/script>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
          }
        } catch {
          cleanBody = message.source.toString();
        }
      }

      // Sanitize Quoted-Printable encoding and MIME boundaries
      const sanitizedBody = cleanBody
        .replace(/^--[\w-]+.*$/gm, "")
        .replace(/^Content-Type:.*$/gm, "")
        .replace(/^Content-Transfer-Encoding:.*$/gm, "")
        .replace(/^Content-Disposition:.*$/gm, "")
        .replace(/=\r?\n/g, "")
        .replace(/=3D/gi, "=")
        .replace(/=E2=80=99/gi, "'")
        .replace(/=E2=80=93/gi, "-")
        .replace(/=E2=80=94/gi, "--")
        .replace(/=C2=A0/gi, " ")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join("\n\n");

      return {
        success: true,
        message: "Email fetched successfully",
        data: {
          id: message.uid,
          from: message.envelope.from?.[0]?.address || message.envelope.from?.[0]?.name || "",
          to: message.envelope.to?.map(user => user.address),
          subject: message.envelope.subject || "",
          date: message.envelope.date,
          body: sanitizedBody || "(No readable text body found in this email)"
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
    auth: userData.imap.auth || {
      user: userData.imap.username,
      pass: userData.imap.password
    }
  });

  client.on("error", (err) => {
    console.error("IMAP Connection Error:", err.message);
  });

  try {
    // Connect to IMAP server
    await client.connect();

    // Lock selected mailbox
    const lock = await client.getMailboxLock(mailbox);

    try {

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

// =======================================================
// Download Email Attachment by UID and Attachment ID
// =======================================================

export const downloadAttachment = async (
  userData,
  emailId,
  attachmentId,
  mailbox = "INBOX",
  res
) => {
  // Create IMAP client
  const client = new ImapFlow({
    host: userData.imap.host,
    port: Number(userData.imap.port),
    secure: userData.imap.secure,
    auth: userData.imap.auth || {
      user: userData.imap.username,
      pass: userData.imap.password
    }
  });

  client.on("error", (err) => {
    console.error("IMAP Connection Error:", err.message);
  });

  try {
    // Connect to IMAP server
    await client.connect();

    // Lock selected mailbox
    const lock = await client.getMailboxLock(mailbox);

    try {
      // Download attachment using email UID and attachment part id
      const download = await client.download(
        emailId,
        attachmentId,
        {
          uid: true
        }
      );

      if (!download || !download.content) {
        lock.release();
        if (client.usable) await client.logout();
        return res.status(404).json({
          success: false,
          message: "Attachment not found"
        });
      }

      const { meta, content } = download;

      // Set response headers
      res.setHeader(
        "Content-Type",
        meta.contentType || "application/octet-stream"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${meta.filename || "attachment"}"`
      );

      const cleanup = async () => {
        try {
          lock.release();
        } catch {}
        if (client.usable) {
          try {
            await client.logout();
          } catch {}
        }
      };

      res.on("finish", cleanup);
      res.on("close", cleanup);
      res.on("error", cleanup);

      // Stream attachment to client
      content.pipe(res);
    } catch (err) {
      lock.release();
      throw err;
    }
  } catch (error) {
    console.error("IMAP ERROR:", error.message);

    if (client.usable) {
      try {
        await client.logout();
      } catch {}
    }

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

// =======================================================
// Move Email by UID to Target Mailbox
// =======================================================
export const moveEmail = async (
  userData,
  emailId,
  targetMailbox,
  mailbox = "INBOX"
) => {
  const client = new ImapFlow({
    host: userData.imap.host,
    port: Number(userData.imap.port),
    secure: userData.imap.secure,
    auth: userData.imap.auth || {
      user: userData.imap.username,
      pass: userData.imap.password
    }
  });

  client.on("error", (err) => {
    console.error("IMAP Connection Error:", err.message);
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);

    try {
      // Auto-create folder/label if it does not exist
      try {
        await client.mailboxCreate(targetMailbox);
      } catch {
        // Ignore error if folder/label already exists
      }

      const result = await client.messageMove(emailId, targetMailbox, { uid: true });
      return {
        success: true,
        message: `Email moved to ${targetMailbox} successfully`,
        data: result
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
// Delete Email by UID
// =======================================================
export const deleteEmail = async (
  userData,
  emailId,
  mailbox = "INBOX"
) => {
  const client = new ImapFlow({
    host: userData.imap.host,
    port: Number(userData.imap.port),
    secure: userData.imap.secure,
    auth: userData.imap.auth || {
      user: userData.imap.username,
      pass: userData.imap.password
    }
  });

  // Prevent unhandled ECONNRESET / error events from crashing Node.js
  client.on("error", (err) => {
    console.error("IMAP Connection Error (deleteEmail):", err.message);
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);

    try {
      await client.messageDelete(emailId, { uid: true });
      return {
        success: true,
        message: "Email deleted successfully"
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
// Mark Email as Read or Unread by UID
// =======================================================
export const markReadStatus = async (
  userData,
  emailId,
  read = true,
  mailbox = "INBOX"
) => {
  const client = new ImapFlow({
    host: userData.imap.host,
    port: Number(userData.imap.port),
    secure: userData.imap.secure,
    auth: userData.imap.auth || {
      user: userData.imap.username,
      pass: userData.imap.password
    }
  });

  // Prevent unhandled ECONNRESET / error events from crashing Node.js
  client.on("error", (err) => {
    console.error("IMAP Connection Error (markReadStatus):", err.message);
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);

    try {
      if (read) {
        await client.messageFlagsAdd(emailId, ["\\Seen"], { uid: true });
      } else {
        await client.messageFlagsRemove(emailId, ["\\Seen"], { uid: true });
      }
      return {
        success: true,
        message: `Email marked as ${read ? "read" : "unread"} successfully`
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
// Archive Email by UID
// =======================================================
export const archiveEmail = async (
  userData,
  emailId,
  mailbox = "INBOX",
  archiveMailbox = "Archive"
) => {
  return await moveEmail(userData, emailId, archiveMailbox, mailbox);
};

// =======================================================
// Mark Email as Spam / Junk by UID
// =======================================================
export const spamEmail = async (
  userData,
  emailId,
  mailbox = "INBOX",
  spamMailbox = "Junk"
) => {
  return await moveEmail(userData, emailId, spamMailbox, mailbox);
};

// =======================================================
// Mark Email as Important / Flagged by UID
// =======================================================
export const markImportantStatus = async (
  userData,
  emailId,
  important = true,
  mailbox = "INBOX"
) => {
  const client = new ImapFlow({
    host: userData.imap.host,
    port: Number(userData.imap.port),
    secure: userData.imap.secure,
    auth: userData.imap.auth || {
      user: userData.imap.username,
      pass: userData.imap.password
    }
  });

  // Prevent unhandled ECONNRESET / error events from crashing Node.js
  client.on("error", (err) => {
    console.error("IMAP Connection Error (markImportantStatus):", err.message);
  });

  try {
    await client.connect();
    const lock = await client.getMailboxLock(mailbox);

    try {
      if (important) {
        await client.messageFlagsAdd(emailId, ["\\Flagged"], { uid: true });
      } else {
        await client.messageFlagsRemove(emailId, ["\\Flagged"], { uid: true });
      }
      return {
        success: true,
        message: `Email marked as ${important ? "important" : "not important"} successfully`
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
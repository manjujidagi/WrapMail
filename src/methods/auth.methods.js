import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";

export const testConnection = async (userData) => {
  let imapClient;

  try {
    // Test IMAP
    if (userData.imap) {
      imapClient = new ImapFlow({
        host: userData.imap.host,
        port: userData.imap.port,
        secure: userData.imap.secure,
        auth: userData.imap.auth,
      });

      await imapClient.connect();
      await imapClient.logout();
    }

    // Test SMTP
    if (userData.smtp) {
      const transporter = nodemailer.createTransport({
        host: userData.smtp.host,
        port: userData.smtp.port,
        secure: userData.smtp.secure,
        auth: userData.smtp.auth,
      });

      await transporter.verify();
    }

    return {
      success: true,
      message: "Connection successful",
    };
  } catch (error) {
    if (imapClient) {
      try {
        await imapClient.logout();
      } catch {}
    }

    return {
      success: false,
      message: error.message,
    };
  }
};
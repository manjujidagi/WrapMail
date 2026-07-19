import { Router } from "express";
import { encrypt } from "../methods/crypto.methods.js";
import { testConnection } from "../methods/auth.methods.js";

const router = Router();

router.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "WrapMail",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

router.post("/login", async (req, res) => {
  try {
    const body = req.body;
    const user_data = {};

    // Validate body
    if (!body) {
      return res.status(400).json({
        error: "Invalid request body",
        error_code: "INVALID_REQUEST_BODY",
      });
    }

    // Either IMAP or SMTP should be present
    if (!body.imap && !body.smtp) {
      return res.status(400).json({
        error: "Either imap or smtp should be present",
        error_code: "MISSING_IMAP_SMTP",
      });
    }

    /**
     * IMAP Validation
     */
    if (body.imap) {
      const { host, port, secure, username, password } = body.imap;

      if (
        !("host" in body.imap) ||
        !("port" in body.imap) ||
        !("secure" in body.imap) ||
        !("username" in body.imap) ||
        !("password" in body.imap)
      ) {
        return res.status(400).json({
          error: "Invalid IMAP configuration",
          error_code: "INVALID_IMAP_CONFIGURATION",
        });
      }

      user_data.imap = {
        host,
        port,
        secure,
        auth: {
          user: username,
          pass: password,
        },
      };
    }

    /**
     * SMTP Validation
     */
    if (body.smtp) {
      const { host, port, secure, username, password } = body.smtp;

      if (
        !("host" in body.smtp) ||
        !("port" in body.smtp) ||
        !("secure" in body.smtp) ||
        !("username" in body.smtp) ||
        !("password" in body.smtp)
      ) {
        return res.status(400).json({
          error: "Invalid SMTP configuration",
          error_code: "INVALID_SMTP_CONFIGURATION",
        });
      }

      user_data.smtp = {
        host,
        port,
        secure,
        auth: {
          user: username,
          pass: password,
        },
      };
    }

    /**
     * Test Email Connection
     */
    const connection = await testConnection(user_data);

    if (!connection.success) {
      return res.status(401).json({
        success: false,
        message: connection.message,
      });
    }

    /**
     * Encrypt Credentials
     */
    const encryptedUserData = encrypt(user_data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: encryptedUserData,
    });
  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
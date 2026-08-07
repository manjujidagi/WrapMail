import { Router } from "express";
import { sendEmail, forwardEmail } from "../methods/smtp.methods.js";

const router = Router();

// Send Email Route
router.post("/send", async (req, res) => {

  try {

    const { to, subject, text } = req.body;

    // Basic Validation
    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        message: "to, subject and text are required"
      });
    }

    // Send Email
    const result = await sendEmail(req.decryptedData, {
      to,
      subject,
      text
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Failed to send email"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: result
    });

  } catch (error) {

    console.error("SMTP ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send email"
    });

  }

});

// Forward Email Route
router.post("/forward", async (req, res) => {
  try {
    const { emailId, to, comment, mailbox } = req.body;

    if (!emailId || !to) {
      return res.status(400).json({
        success: false,
        message: "emailId and to recipient are required"
      });
    }

    const numEmailId = Number(emailId);
    if (!Number.isInteger(numEmailId) || numEmailId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid emailId"
      });
    }

    const result = await forwardEmail(req.decryptedData, {
      emailId: numEmailId,
      to,
      comment,
      mailbox
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Failed to forward email"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email forwarded successfully",
      data: result
    });
  } catch (error) {
    console.error("SMTP FORWARD ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to forward email"
    });
  }
});

export default router;
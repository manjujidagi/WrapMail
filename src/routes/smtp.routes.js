import { Router } from "express";
import { sendEmail } from "../methods/smtp.methods.js";

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
    const result = await sendEmail(req.decryptedData,{
      to,
      subject,
      text
    });

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

export default router;
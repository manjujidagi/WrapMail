import { Router } from "express";
import { getEmails, getEmail } from "../methods/imap.methods.js";

const router = Router();

router.get("/emails", async (req, res) => {
  try {
    const result = await getEmails(req.decryptedData, req.query);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/emails/:email_id", async (req, res) => {
  try {
    // Validate email id
    const emailId = Number(req.params.email_id);

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email id"
      });
    }

    // Fetch email
    const result = await getEmail(
      req.decryptedData,
      emailId,
      req.query.mailbox
    );

    // Email not found
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
import { Router } from "express";
import { getEmails } from "../methods/imap.methods.js";

const router = Router();

// Get Emails
router.get("/inbox", async (req, res) => {
  try {
    // Get mailbox from query parameter
    const { mailbox = "INBOX" } = req.query;

    // Fetch emails
    const result = await getEmails(req.decryptedData, mailbox);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
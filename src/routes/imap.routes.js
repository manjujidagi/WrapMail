import { Router } from "express";
import { getInboxEmails } from "../methods/imap.methods.js";

const router = Router();

// Get Inbox Emails
router.get("/inbox", async (req, res) => {

  try {
    const result = await getInboxEmails(req.decryptedData);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
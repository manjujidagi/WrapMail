import { Router } from "express";
import {
  getEmails,
  getEmail,
  getAttachments
} from "../methods/imap.methods.js";

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

    // Email not found or other IMAP error
    if (!result.success) {
      const status =
        result.message === "Email not found" ? 404 : 500;
        
      return res.status(status).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/emails/:email_id/attachments", async (req, res) => {
  try {
    // Validate email id
    const emailId = Number(req.params.email_id);

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email id"
      });
    }

    // Fetch attachments
    const result = await getAttachments(
      req.decryptedData,
      emailId,
      req.query.mailbox
    );

    // Email not found
    if (!result.success) {
      const status =
        result.message === "Email not found" ? 404 : 500;

      return res.status(status).json(result);
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
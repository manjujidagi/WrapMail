import { Router } from "express";
import {
  getEmails,
  getEmail,
  getAttachments,
  downloadAttachment
} from "../methods/imap.methods.js";

const router = Router();

router.get("/emails", async (req, res) => {
  try {
    const result = await getEmails(req.decryptedData, req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/emails/:email_id", async (req, res) => {
  try {
    const emailId = Number(req.params.email_id);

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email id"
      });
    }

    const result = await getEmail(
      req.decryptedData,
      emailId,
      req.query.mailbox
    );

    if (!result.success) {
      return res.status(
        result.message === "Email not found" ? 404 : 500
      ).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get("/emails/:email_id/attachments", async (req, res) => {
  try {
    const emailId = Number(req.params.email_id);

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email id"
      });
    }

    const result = await getAttachments(
      req.decryptedData,
      emailId,
      req.query.mailbox
    );

    if (!result.success) {
      return res.status(
        result.message === "Email not found" ? 404 : 500
      ).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get(
  "/emails/:email_id/attachments/:attachment_id/download",
  async (req, res) => {
    try {
      const emailId = Number(req.params.email_id);

      if (!Number.isInteger(emailId) || emailId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid email id"
        });
      }

      const attachmentId = req.params.attachment_id;

      if (!attachmentId) {
        return res.status(400).json({
          success: false,
          message: "Invalid attachment id"
        });
      }

      await downloadAttachment(
        req.decryptedData,
        emailId,
        attachmentId,
        req.query.mailbox,
        res
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

export default router;
import { Router } from "express";
import {
  getEmails,
  getEmail,
  getAttachments,
  downloadAttachment,
  moveEmail,
  deleteEmail,
  markReadStatus,
  archiveEmail,
  spamEmail,
  markImportantStatus
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

router.post("/emails/:email_id/move", async (req, res) => {
  try {
    const emailId = Number(req.params.email_id);
    const { targetMailbox, mailbox } = req.body;

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid email id" });
    }

    if (!targetMailbox) {
      return res.status(400).json({ success: false, message: "targetMailbox is required" });
    }

    const result = await moveEmail(req.decryptedData, emailId, targetMailbox, mailbox);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/emails/:email_id", async (req, res) => {
  try {
    const emailId = Number(req.params.email_id);
    const { mailbox } = req.body || {};

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid email id" });
    }

    const result = await deleteEmail(req.decryptedData, emailId, mailbox);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/emails/:email_id/read", async (req, res) => {
  try {
    const emailId = Number(req.params.email_id);
    const { read = true, mailbox } = req.body || {};

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid email id" });
    }

    const result = await markReadStatus(req.decryptedData, emailId, Boolean(read), mailbox);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/emails/:email_id/archive", async (req, res) => {
  try {
    const emailId = Number(req.params.email_id);
    const { mailbox, archiveMailbox } = req.body || {};

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid email id" });
    }

    const result = await archiveEmail(req.decryptedData, emailId, mailbox, archiveMailbox);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/emails/:email_id/spam", async (req, res) => {
  try {
    const emailId = Number(req.params.email_id);
    const { mailbox, spamMailbox } = req.body || {};

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid email id" });
    }

    const result = await spamEmail(req.decryptedData, emailId, mailbox, spamMailbox);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/emails/:email_id/important", async (req, res) => {
  try {
    const emailId = Number(req.params.email_id);
    const { important = true, mailbox } = req.body || {};

    if (!Number.isInteger(emailId) || emailId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid email id" });
    }

    const result = await markImportantStatus(req.decryptedData, emailId, Boolean(important), mailbox);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
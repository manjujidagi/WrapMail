import { Router } from "express";
import { getEmails,getEmail } from "../methods/imap.methods.js";

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
    const result = await getEmail(
      req.decryptedData,
      req.params.email_id
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
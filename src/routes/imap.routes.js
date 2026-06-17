import { Router } from "express";
import { getEmails } from "../methods/imap.methods.js";

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

export default router;
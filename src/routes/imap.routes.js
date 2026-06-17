import { Router } from "express";
import { getEmails } from "../methods/imap.methods.js";

const router = Router();

router.get('/emails', (req, res) => {
    // decrypted data
    const decryptedData = req.decryptedData;
    const emails = getEmails(decryptedData.imap)

    return res.status(200).json({ message: 'Emails fetched successfully', data: emails });
});

export default router;
import { Router } from "express";
import { getEmails } from "../methods/imap.methods.js";

const router = Router();

router.get('/emails', (req, res) => {

    // decrypted data
    const decryptedData = req.decryptedData;
    const emails = getEmails(decryptedData.imap)

    return res.status(200).json({ message: 'Emails fetched successfully', data: emails });

    // // Handle login logic here
    // const body = req.body;

    // const user_data = {};

    // // Validate body
    // if (!body) {
    //     return res.status(400).json({ message: 'Invalid request body' });
    // }
    // // either imap or smtp should be present
    // if (!body.imap && !body.smtp) {
    //     return res.status(400).json({ message: 'Either imap or smtp should be present' });
    // }

    // // if imap in body, then it should have host, port, secure, username, password
    // if (body.imap) {
    //     const { host, port, secure, username, password } = body.imap;
    //     if (!('host' in body.imap) || !('port' in body.imap) || !('secure' in body.imap) || !('username' in body.imap) || !('password' in body.imap)) {
    //         return res.status(400).json({ message: 'Invalid IMAP configuration' });
    //     }
    //     user_data.imap = { host, port, secure, auth: { user: username, pass: password } };
    // }

    // // Return encrypted data
    // try {
    //     const encrypted_user_data = encrypt(user_data);
    //     return res.status(200).json({ message: 'Login successful', data: encrypted_user_data });
    // } catch (error) {
    //     return res.status(500).json({ message: 'Error encrypting user data', error: error.message });
    // }
});

export default router;
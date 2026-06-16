import { Router } from "express";
import { encrypt } from './../methods/crypto.methods.js';

const router = Router();

router.post('/login', (req, res) => {
    // Handle login logic here
    const body = req.body;

    const user_data = {};

    // Validate body
    if (!body) {
        return res.status(400).json({ error: 'Invalid request body', error_code: 'INVALID_REQUEST_BODY' });
    }
    // either imap or smtp should be present
    if (!body.imap && !body.smtp) {
       return res.status(400).json({ error: 'Either imap or smtp should be present', error_code: 'MISSING_IMAP_SMTP' });
    }

    // if imap in body, then it should have host, port, secure, username, password
    if (body.imap) {
        const { host, port, secure, username, password } = body.imap;
        if (!('host' in body.imap) || !('port' in body.imap) || !('secure' in body.imap) || !('username' in body.imap) || !('password' in body.imap)) {
             return res.status(400).json({ error: 'Invalid IMAP configuration', error_code: 'INVALID_IMAP_CONFIGURATION' });
        }
        user_data.imap = { host, port, secure, auth: { user: username, pass: password } };
    }

    // Return encrypted data
    try {
        const encrypted_user_data = encrypt(user_data);
        return res.status(200).json({ message: 'Login successful', data: encrypted_user_data });
    } catch (error) {
         return res.status(500).json({ error: 'Error encrypting user data', error_code: 'ENCRYPTION_ERROR' });
    }
});

export default router;
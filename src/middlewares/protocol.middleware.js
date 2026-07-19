export const imap_authorize = (req, res, next) => {
  const decryptedData = req.decryptedData;

  // Check if User-Data was successfully decrypted
  if (!decryptedData || typeof decryptedData !== "object") {
    return res.status(400).json({
      error: "Invalid User-Data header",
      error_code: "INVALID_USER_DATA",
    });
  }

  // Check if IMAP configuration exists
  if (!decryptedData.imap) {
    return res.status(400).json({
      error: "IMAP data is missing",
      error_code: "MISSING_IMAP_DATA",
    });
  }

  next();
};

export const smtp_authorize = (req, res, next) => {
  const decryptedData = req.decryptedData;

  // Check if User-Data was successfully decrypted
  if (!decryptedData || typeof decryptedData !== "object") {
    return res.status(400).json({
      error: "Invalid User-Data header",
      error_code: "INVALID_USER_DATA",
    });
  }

  // Check if SMTP configuration exists
  if (!decryptedData.smtp) {
    return res.status(400).json({
      error: "SMTP data is missing",
      error_code: "MISSING_SMTP_DATA",
    });
  }

  next();
};
export const imap_authorize = (req, res, next) => {

  const decryptedData = req.decryptedData;

  if (!('imap' in decryptedData)) {
    return res.status(400).json({ error: 'IMAP data is missing', error_code: 'MISSING_IMAP_DATA' });
  }

  next();
};

export const smtp_authorize = (req, res, next) => {

  const decryptedData = req.decryptedData;

  if (!('smtp' in decryptedData)) {
    return res.status(400).json({ error: 'SMTP data is missing', error_code: 'MISSING_SMTP_DATA' });
  }

  next();
};
export const imap_authorize = (req, res, next) => {

  const decryptedData = req.decryptedData;

  if (!('imap' in decryptedData)) {
    return res.status(400).json({ message: 'IMAP data is missing' });
  }

  next();
};

export const smtp_authorize = (req, res, next) => {

  const decryptedData = req.decryptedData;

  if (!('smtp' in decryptedData)) {
    return res.status(400).json({ message: 'SMTP data is missing' });
  }

  next();
};
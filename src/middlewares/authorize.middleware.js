import { decrypt } from './../methods/crypto.methods.js';

// Check whether header has 'User-Data' and matches with the API_KEY in .env file
const authorize = (req, res, next) => {
  const configData = req.header('User-Data');
  if (!configData) {
    return res.status(400).json({ message: 'User-Data header is missing' });
  }

  try {
    const decryptedData = decrypt(configData);

    // TODO : Also verify all the required fields are present in decryptedData

    req.decryptedData = decryptedData;
  } catch (error) {
    return res.status(400).json({ message: 'Invalid User-Data header' });
  }

  next();
};

export default authorize;
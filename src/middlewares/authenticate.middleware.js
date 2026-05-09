// Check whether header has 'X-API-Key' and matches with the API_KEY in .env file
const authenticate = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

export default authenticate;
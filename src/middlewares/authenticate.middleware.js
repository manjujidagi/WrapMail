const authenticate = (req, res, next) => {

  const apiKey = req.header('X-API-Key');



  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' });
  }

  next();
};

export default authenticate;
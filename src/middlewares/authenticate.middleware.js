const authenticate = (req, res, next) => {

  const apiKey = req.header('X-API-Key');

  console.log('HEADER KEY:', apiKey);
  console.log('ENV KEY:', process.env.API_KEY);

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  next();
};

export default authenticate;
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token)
    return res.status(401).json({ error: 'missing or malformed Authorization header' });

  try {
    const payload = jwt.verify(token, secret);
    if (payload.type === 'refresh')
      return res.status(401).json({ error: 'refresh tokens cannot be used on this API' });
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    next();
  } catch (err) {
    res.status(401).json({ error: err.name === 'TokenExpiredError' ? 'token expired' : 'invalid token' });
  }
};

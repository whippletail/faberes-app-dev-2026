const jwt = require("jsonwebtoken");

// Protects any route it is attached to. On success, req.user = { userId, iat, exp }.
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization; // expected: "Bearer <token>"
  const [scheme, token] = header ? header.split(" ") : [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }); // checks signature + expiry
    next();
  } catch (err) {
    const error = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    res.status(401).json({ error });
  }
};

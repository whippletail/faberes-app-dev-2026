const User = require("../models/user.model");

// Never send passwordHash to the client.
const publicProfile = (u) => ({ id: u.id, username: u.username, email: u.email, bio: u.bio });

// GET /api/users/me  - basic info for the logged-in user
exports.getMe = (req, res) => {
  const user = User.findById(req.user.userId); // req.user was set by the auth middleware
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(publicProfile(user));
};

// GET /api/users/about-me  - full details: username, email, bio
exports.getAboutMe = (req, res) => {
  const user = User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    ...publicProfile(user),
    tokenExpiresAt: new Date(req.user.exp * 1000).toISOString(), // from the JWT's exp claim
  });
};

// GET /api/users  - every registered user (email is left out on purpose)
exports.getAllUsers = (req, res) => {
  const users = User.findAll().map((u) => ({ id: u.id, username: u.username, bio: u.bio }));
  res.json({ count: users.length, users });
};

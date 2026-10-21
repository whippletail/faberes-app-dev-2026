const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { secret } = require('../config');
const { users, save } = require('../data/store');
const { hashPassword, verifyPassword } = require('../utils/password');

const ROLES = ['reader', 'author', 'admin'];
const isStr = (v) => typeof v === 'string' && v.trim() !== '';

const signAccess = (u) =>
  jwt.sign({ id: u.id, username: u.username, role: u.role }, secret, { expiresIn: '15m' });
const signRefresh = (u) =>
  jwt.sign({ id: u.id, type: 'refresh' }, secret, { expiresIn: '7d', jwtid: crypto.randomUUID() });

exports.register = (req, res) => {
  const { username, password, role } = req.body || {};
  if (!isStr(username) || !isStr(password) || !isStr(role))
    return res.status(400).json({ error: 'username, password and role are required' });
  if (!ROLES.includes(role))
    return res.status(400).json({ error: 'role must be reader, author or admin' });

  const name = username.trim();
  if (users.some((u) => u.username.toLowerCase() === name.toLowerCase()))
    return res.status(409).json({ error: 'username already taken' });

  const user = {
    id: users.reduce((max, u) => Math.max(max, u.id), 0) + 1,
    username: name,
    hashed_password: hashPassword(password),
    role,
    refresh_token: null,
    created_at: new Date().toISOString(),
    revoked_at: null,
  };
  users.push(user);
  save();
  res.status(201).json({ id: user.id, username: user.username, role: user.role, created_at: user.created_at });
};

exports.login = (req, res) => {
  const { username, password } = req.body || {};
  if (!isStr(username) || !isStr(password))
    return res.status(400).json({ error: 'username and password are required' });

  const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.hashed_password))
    return res.status(401).json({ error: 'wrong username or password' });

  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  user.refresh_token = refreshToken;
  user.revoked_at = null;
  save();
  res.json({ accessToken, refreshToken });
};

exports.refresh = (req, res) => {
  const { refreshToken } = req.body || {};
  if (!isStr(refreshToken)) return res.status(400).json({ error: 'refreshToken is required' });

  let payload;
  try {
    payload = jwt.verify(refreshToken, secret);
  } catch {
    return res.status(401).json({ error: 'invalid or expired refresh token' });
  }
  const user = users.find((u) => u.id === payload.id);
  if (payload.type !== 'refresh' || !user || user.refresh_token !== refreshToken)
    return res.status(401).json({ error: 'invalid or revoked refresh token' });

  res.json({ accessToken: signAccess(user) });
};

exports.logout = (req, res) => {
  const { refreshToken } = req.body || {};
  if (!isStr(refreshToken)) return res.status(400).json({ error: 'refreshToken is required' });

  const user = users.find((u) => u.refresh_token === refreshToken);
  if (user) {
    user.refresh_token = null;
    user.revoked_at = new Date().toISOString();
    save();
  }
  res.json({ message: 'logged out' });
};

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const users = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serves the HTML/CSS files in /public. Opening a page in the browser is
// always a GET, so this is the only non-POST traffic; the API is POST only.
app.use(express.static(path.join(__dirname, 'public'), { index: 'login.html' }));

// ---------- helpers ----------

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

// Returns every field that is missing or blank, e.g. ['email', 'password'].
function findEmptyFields(body, fields) {
  return fields.filter((field) => {
    const value = body ? body[field] : undefined;
    return typeof value !== 'string' || value.trim() === '';
  });
}

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// Sends an error response. `errors` maps field names to the text the frontend
// shows under that field, e.g. { username: 'That username is already taken.' }
function fail(res, status, message, errors = {}) {
  return res.status(status).json({ message, errors });
}

// 400 for empty fields, naming every empty field at once.
function emptyFieldsResponse(res, emptyFields) {
  const list =
    emptyFields.length > 1
      ? `${emptyFields.slice(0, -1).join(', ')} and ${emptyFields[emptyFields.length - 1]}`
      : emptyFields[0];
  const errors = Object.fromEntries(emptyFields.map((f) => [f, `${capitalize(f)} is required.`]));
  return fail(res, 400, `Please fill in your ${list}.`, errors);
}

const publicUser = (u) => ({ id: u.id, email: u.email, username: u.username });

// ---------- POST /api/signup ----------

app.post('/api/signup', (req, res) => {
  const emptyFields = findEmptyFields(req.body, ['email', 'username', 'password']);
  if (emptyFields.length) return emptyFieldsResponse(res, emptyFields);

  const email = req.body.email.trim().toLowerCase();
  const username = req.body.username.trim();
  const { password } = req.body;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail(res, 400, 'Enter a valid email address.', {
      email: 'Enter a valid email address.',
    });
  }

  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return fail(res, 409, 'That username is already taken.', {
      username: 'That username is already taken.',
    });
  }
  if (users.some((u) => u.email === email)) {
    return fail(res, 409, 'An account with that email already exists.', {
      email: 'An account with that email already exists.',
    });
  }

  const user = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    email,
    username,
    password: hashPassword(password),
  };
  users.push(user);

  res.status(201).json({ message: 'Account created.', user: publicUser(user) });
});

// ---------- POST /api/login ----------
// username and password arrive in the request body, never in the URL.

app.post('/api/login', (req, res) => {
  const emptyFields = findEmptyFields(req.body, ['username', 'password']);
  if (emptyFields.length) return emptyFieldsResponse(res, emptyFields);

  const username = req.body.username.trim();
  const { password } = req.body;

  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user || !verifyPassword(password, user.password)) {
    return fail(res, 401, 'Incorrect username or password.');
  }

  res.status(200).json({ message: 'Logged in.', user: publicUser(user) });
});

// ---------- error handling ----------

// Malformed JSON bodies come back as a 400 instead of an HTML error page.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return fail(res, 400, 'Request body must be valid JSON.');
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

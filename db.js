// Demo "database": a plain JSON array kept in memory.
// Each item is keyed by a unique numeric `id`.
// Data resets whenever the server restarts.
//
// Item shape: { id, email, username, password }
// (`password` holds a salted hash, never the raw password.)

const users = [];

module.exports = users;

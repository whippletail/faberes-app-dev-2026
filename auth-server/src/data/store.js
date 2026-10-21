const path = require('path');
const { LocalStorage } = require('node-localstorage');

const ls = new LocalStorage(path.join(__dirname, '..', '..', 'storage'));
const users = JSON.parse(ls.getItem('users') || '[]'); // loaded on startup
const save = () => ls.setItem('users', JSON.stringify(users)); // called after every change

module.exports = { users, save };

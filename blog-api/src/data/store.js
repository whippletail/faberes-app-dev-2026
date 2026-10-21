const path = require('path');
const { LocalStorage } = require('node-localstorage');

const ls = new LocalStorage(path.join(__dirname, '..', '..', 'storage'));
const posts = JSON.parse(ls.getItem('posts') || '[]'); // loaded on startup
const save = () => ls.setItem('posts', JSON.stringify(posts)); // called after every change

module.exports = { posts, save };

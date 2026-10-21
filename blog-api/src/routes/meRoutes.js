const router = require('express').Router();
const { mine } = require('../controllers/postController');
const authenticate = require('../middleware/authenticate');

router.get('/posts', authenticate, mine);

module.exports = router;

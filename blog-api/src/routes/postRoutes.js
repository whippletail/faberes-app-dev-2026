const router = require('express').Router();
const c = require('../controllers/postController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', c.list); // public
router.get('/:id', c.getOne); // public
router.post('/', authenticate, authorize('author', 'admin'), c.create);
router.put('/:id', authenticate, c.update); // ownership checked in controller
router.delete('/:id', authenticate, authorize('admin'), c.remove);

module.exports = router;

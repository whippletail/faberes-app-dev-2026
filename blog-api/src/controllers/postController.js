const { posts, save } = require('../data/store');

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const findPost = (id) => posts.find((p) => p.id === Number(id));

exports.list = (req, res) => res.json(posts);

exports.getOne = (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });
  res.json(post);
};

exports.create = (req, res) => {
  const { title, content } = req.body || {};
  if (!isStr(title) || !isStr(content))
    return res.status(400).json({ error: 'title and content are required' });

  const now = new Date().toISOString();
  const post = {
    id: posts.reduce((max, p) => Math.max(max, p.id), 0) + 1,
    user_id: req.user.id, // authorId comes from the token
    author: req.user.username,
    title: title.trim(),
    content: content.trim(),
    created_at: now,
    updated_at: now,
  };
  posts.push(post);
  save();
  res.status(201).json(post);
};

exports.update = (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return res.status(404).json({ error: 'post not found' });
  if (post.user_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'only the post owner or an admin can edit this post' });

  const { title, content } = req.body || {};
  if (title === undefined && content === undefined)
    return res.status(400).json({ error: 'provide a title or content to update' });
  if ((title !== undefined && !isStr(title)) || (content !== undefined && !isStr(content)))
    return res.status(400).json({ error: 'title and content must be non-empty text' });

  if (title !== undefined) post.title = title.trim();
  if (content !== undefined) post.content = content.trim();
  post.updated_at = new Date().toISOString();
  save();
  res.json(post);
};

exports.remove = (req, res) => {
  const index = posts.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'post not found' });
  const [removed] = posts.splice(index, 1);
  save();
  res.json({ message: 'post deleted', post: removed });
};

exports.mine = (req, res) => res.json(posts.filter((p) => p.user_id === req.user.id));

exports.notFound = (req, res) => res.status(404).json({ error: 'route not found' });

exports.errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid JSON body' });
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
};

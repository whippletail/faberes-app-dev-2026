const { BLOG_PORT } = require('./src/config'); // loads ../.env first
const path = require('path');
const express = require('express');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
app.use(require('./src/middleware/cors'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // serves the UI at "/"
app.use('/api/posts', require('./src/routes/postRoutes'));
app.use('/api/me', require('./src/routes/meRoutes'));
app.use(notFound);
app.use(errorHandler);

app.listen(BLOG_PORT, () => console.log(`Blog API running on http://localhost:${BLOG_PORT}`));

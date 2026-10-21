const { AUTH_PORT } = require('./src/config'); // loads ../.env first
const express = require('express');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
app.use(require('./src/middleware/cors'));
app.use(express.json());
app.use('/', require('./src/routes/authRoutes'));
app.use(notFound);
app.use(errorHandler);

app.listen(AUTH_PORT, () => console.log(`Auth Server running on http://localhost:${AUTH_PORT}`));

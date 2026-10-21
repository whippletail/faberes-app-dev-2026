require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env at the project root.');
  process.exit(1);
}

module.exports = {
  secret: process.env.JWT_SECRET,
  AUTH_PORT: process.env.AUTH_PORT || 4000,
  BLOG_PORT: process.env.BLOG_PORT || 5000,
};

const { createHash, timingSafeEqual } = require('node:crypto');

// Public reads stay public. Writes must come through the authenticated Next.js
// admin proxy; CORS and a browser localStorage flag cannot protect these routes.
module.exports = function requireAdminWrite(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  res.set('Cache-Control', 'private, no-store');
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return res.status(503).json({ error: 'Admin writes are not configured' });
  const supplied = req.get('Authorization') || '';
  const hash = (value) => createHash('sha256').update(value).digest();
  if (!timingSafeEqual(hash(supplied), hash(`Bearer ${token}`))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * Middleware: requireAuth
 * Extracts the Bearer token from the incoming request and attaches it
 * to res.locals so route handlers can forward it to Laravel.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  res.locals.token = authHeader.split(' ')[1];
  next();
}

module.exports = { requireAuth };

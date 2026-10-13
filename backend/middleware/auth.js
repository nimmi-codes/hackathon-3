const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWTs are signed with ADMIN_PASSWORD (no separate JWT_SECRET)
const secret = () => process.env.ADMIN_PASSWORD;
const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, secret(), { expiresIn: '7d' });

async function protect(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const { id } = jwt.verify(token, secret());
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Staff/admin access only' });
  next();
}

module.exports = { signToken, protect, adminOnly };

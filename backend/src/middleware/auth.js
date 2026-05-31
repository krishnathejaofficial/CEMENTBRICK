// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (...roles) => (req, res, next) => {
  const adminRoles = roles.length ? roles : ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'LOGISTICS_MANAGER', 'ACCOUNTS'];
  if (!adminRoles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    }
  } catch {}
  next();
};

module.exports = { authenticate, requireAdmin, optionalAuth };

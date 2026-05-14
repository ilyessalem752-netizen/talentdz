const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Protect routes — requires valid JWT
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Non authentifié. Veuillez vous connecter.', 401));
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user) {
      return next(new AppError('Utilisateur introuvable.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Compte désactivé. Contactez l\'administrateur.', 403));
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Mot de passe modifié récemment. Veuillez vous reconnecter.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expirée. Veuillez vous reconnecter.', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalide.', 401));
    }
    next(err);
  }
};

/**
 * Restrict to specific roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Accès refusé. Rôle requis: ${roles.join(', ')}`, 403));
    }
    next();
  };
};

/**
 * Optional auth — attaches user if token present, continues either way
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      if (user && user.isActive) req.user = user;
    }
  } catch (_) { /* ignore */ }
  next();
};

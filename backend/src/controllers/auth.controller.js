const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshExpiry } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

const sendTokens = (res, user, statusCode = 200, message = 'Succès') => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to DB
  user.refreshTokens.push({ token: refreshToken, expiresAt: getRefreshExpiry() });
  user.cleanRefreshTokens();
  user.save({ validateBeforeSave: false });

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(statusCode).json({
    success: true,
    message,
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
};

// POST /api/auth/register/student
exports.registerStudent = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('Email déjà utilisé.', 409));

    const user = await User.create({ email, password, role: 'student' });
    await Student.create({ user: user._id, firstName, lastName });

    sendTokens(res, user, 201, 'Compte étudiant créé avec succès');
  } catch (err) { next(err); }
};

// POST /api/auth/register/company
exports.registerCompany = async (req, res, next) => {
  try {
    const { email, password, name, wilaya, sector } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('Email déjà utilisé.', 409));

    const user = await User.create({ email, password, role: 'company' });
    await Company.create({ user: user._id, name, wilaya, sector });

    sendTokens(res, user, 201, 'Compte entreprise créé avec succès');
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Email ou mot de passe incorrect.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Compte désactivé. Contactez l\'administrateur.', 403));
    }

    user.lastLogin = new Date();
    sendTokens(res, user, 200, 'Connexion réussie');
  } catch (err) { next(err); }
};

// POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) return next(new AppError('Refresh token manquant.', 401));

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) return next(new AppError('Utilisateur introuvable.', 401));

    const stored = user.refreshTokens.find(t => t.token === token);
    if (!stored || stored.expiresAt < new Date()) {
      return next(new AppError('Session expirée, veuillez vous reconnecter.', 401));
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== token);
    sendTokens(res, user, 200, 'Token renouvelé');
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Session invalide.', 401));
    }
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findById(req.user.id).select('+refreshTokens');
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t.token !== token);
        await user.save({ validateBeforeSave: false });
      }
    }
    res.clearCookie('refreshToken');
    successResponse(res, {}, 'Déconnexion réussie');
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    let profile = null;
    if (req.user.role === 'student') {
      profile = await Student.findOne({ user: req.user.id });
    } else if (req.user.role === 'company') {
      profile = await Company.findOne({ user: req.user.id });
    }

    successResponse(res, {
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
        isVerified: req.user.isVerified,
        lastLogin: req.user.lastLogin,
      },
      profile,
    });
  } catch (err) { next(err); }
};

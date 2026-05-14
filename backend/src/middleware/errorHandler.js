const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const handleCastError = (err) => new AppError(`Identifiant invalide: ${err.path}`, 400);
const handleDuplicateFields = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field === 'email' ? 'Email' : field} déjà utilisé.`, 409);
};
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map(e => e.message);
  return new AppError(`Données invalides: ${messages.join('. ')}`, 400);
};

module.exports = (err, req, res, next) => {
  let error = { ...err, message: err.message };
  error.statusCode = err.statusCode || 500;

  // Mongoose errors
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateFields(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') error = new AppError('Fichier trop volumineux (max 5MB)', 400);
    else error = new AppError(`Erreur upload: ${err.message}`, 400);
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} — ${error.message}`, { stack: err.stack });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

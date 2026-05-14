const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  next(new AppError(`Route introuvable: ${req.originalUrl}`, 404));
};

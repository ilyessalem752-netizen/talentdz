require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// ── Auto-provision admin account ─────────────────────────────────────────────
// Runs once after DB connects. Guarantees the admin user exists in every
// environment (local, Render, etc.) without needing to run the seeder manually.
// Safe to run on every startup — it is a no-op if the admin already exists.
async function ensureAdminExists() {
  try {
    const User = require('./models/User');

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      logger.info(`✅ Admin account verified: ${existing.email}`);
      return;
    }

    // No admin found — create one from env vars with fallback to demo credentials
    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@talentdz.dz';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';

    await User.create({
      email: adminEmail,
      password: adminPassword,   // pre-save hook hashes this
      role: 'admin',
      isActive: true,
      isVerified: true,
    });

    logger.info(`👑 Admin account created automatically: ${adminEmail}`);
  } catch (err) {
    // Log but do not crash the server — a duplicate-key error means it
    // was created by a concurrent startup, which is fine.
    logger.warn(`ensureAdminExists: ${err.message}`);
  }
}

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  await ensureAdminExists();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 TalentDZ API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Closing server...');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

start();
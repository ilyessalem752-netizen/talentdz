const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Create a notification for a user
 */
exports.createNotification = async (recipientId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
    });
    return notification;
  } catch (err) {
    logger.error(`Notification creation failed: ${err.message}`);
  }
};

/**
 * Notify on application status change
 */
exports.notifyApplicationStatus = async (application, newStatus, studentUserId) => {
  const statusMessages = {
    viewed: { title: 'Candidature consultée', message: 'Une entreprise a consulté votre candidature.' },
    shortlisted: { title: '🎉 Sélectionné !', message: 'Vous avez été présélectionné pour un poste !' },
    interview: { title: '📅 Entretien planifié', message: 'Vous avez été invité à un entretien !' },
    offered: { title: '🏆 Offre reçue !', message: 'Félicitations ! Une entreprise vous fait une offre !' },
    rejected: { title: 'Candidature non retenue', message: 'Votre candidature n\'a pas été retenue cette fois.' },
  };

  const msg = statusMessages[newStatus];
  if (msg) {
    await exports.createNotification(
      studentUserId,
      `application_${newStatus}`,
      msg.title,
      msg.message,
      { applicationId: application._id, jobId: application.job }
    );
  }
};

/**
 * Notify company on new application
 */
exports.notifyNewApplication = async (companyUserId, jobTitle, studentName, applicationId) => {
  await exports.createNotification(
    companyUserId,
    'application_received',
    'Nouvelle candidature',
    `${studentName} a postulé pour le poste : ${jobTitle}`,
    { applicationId }
  );
};

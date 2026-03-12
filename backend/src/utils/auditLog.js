const AuditLog = require('../models/AuditLog');

const logAdminAction = async ({ admin, action, targetType, targetId, req, metadata = {} }) => {
  if (admin?.role !== 'admin') {
    return;
  }

  try {
    await AuditLog.create({
      admin: admin._id,
      action,
      targetType,
      targetId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata
    });
  } catch (error) {
    console.error('Audit log write failed:', error.message);
  }
};

module.exports = {
  logAdminAction
};
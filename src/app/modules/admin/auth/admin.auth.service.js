import httpStatus from 'http-status';
import { Admin } from '../admin.model.js';
import { jwtHelpers } from '../../../../helpers/jwtHelpers.js';
import config from '../../../../config/index.js';
import ApiError from '../../../../errors/ApiError.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
// import { sendmail } from '../../../../utils/mailSender.js';
import { Op } from 'sequelize';
import { sendMail } from '../../../../utils/mailSender.js';

export const registerAdmin = async (payload) => {
  // Check if email already exists
  const existingAdmin = await Admin.findOne({ where: { email: payload.email } });
  if (existingAdmin) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password, 12);

  // Create admin
  const admin = await Admin.create({
    ...payload,
    password: hashedPassword,
  });

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
};

export const loginAdmin = async (email, password) => {
  
  // Find admin by email with password
  const admin = await Admin.findOne({
    where: { email },
    attributes: { include: ['password'] },
  });

  if (!admin) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  if (admin.status !== 'active') {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  // Check password
  const isPasswordValid = await admin.isPasswordMatched(password);
  
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  // Generate token
  const token = jwtHelpers.createToken(
    { id: admin.id, role: admin.role },
    config.jwt.admin_secret,
    config.jwt.admin_expires_in
  );

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

export const forgotPassword = async (email) => {
  // Find admin
  const admin = await Admin.findOne({ where: { email } });
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No admin found with this email');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set password reset token and expiry
  await Admin.update(
    {
      passwordResetToken,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    { where: { id: admin.id } }
  );

  // Send email
  const resetURL = `${config.client_url}/admin/reset-password/${resetToken}`;
  const mailBody = `
    <h2>Password Reset Request</h2>
    <p>Please click the link below to reset your password. This link is valid for 10 minutes.</p>
    <a href="${resetURL}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  try {
    await sendMail(
      admin.email,
      'Password Reset Request',
      'Reset your admin password',
      mailBody
    );

    return { message: 'Password reset email sent successfully' };
  } catch (error) {
    // If email fails, remove reset token
    await Admin.update(
      {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
      { where: { id: admin.id } }
    );
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error sending email');
  }
};

export const resetPassword = async (token, newPassword) => {
  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find admin with valid token
  const admin = await Admin.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: new Date() },
    },
  });

  if (!admin) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await Admin.update(
    {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
    { where: { id: admin.id } }
  );

  return { message: 'Password reset successful' };
};

export const getAdminProfile = async (adminId) => {
  const admin = await Admin.findByPk(adminId, {
    attributes: { exclude: ['password'] },
  });
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  return admin;
};

export const changePassword = async (adminId, currentPassword, newPassword) => {
  // Find admin with password
  const admin = await Admin.findByPk(adminId, {
    attributes: { include: ['password'] },
  });

  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  // Verify current password
  const isPasswordValid = await admin.isPasswordMatched(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await Admin.update(
    { password: hashedPassword },
    { where: { id: adminId } }
  );

  return { message: 'Password changed successfully' };
};

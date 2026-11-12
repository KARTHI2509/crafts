import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter based on environment
const createTransporter = () => {
  // For production, use a real email service like SendGrid, Mailgun, etc.
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // For development, use Ethereal (fake SMTP service) or console logging
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Default: Log to console (for development without SMTP config)
  return null;
};

const transporter = createTransporter();

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Logic Crafts Connect" <noreply@logiccrafts.com>',
    to: email,
    subject: 'Verify Your Email - Logic Crafts Connect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Logic Crafts Connect</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for registering with Logic Crafts Connect. To complete your registration and start exploring amazing handmade crafts, please verify your email address.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>2024 Logic Crafts Connect. Empowering Artisans, Connecting Communities.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  } else {
    // Log to console if no transporter configured
    console.log('========================================');
    console.log('VERIFICATION EMAIL (Development Mode)');
    console.log('========================================');
    console.log('To:', email);
    console.log('Name:', name);
    console.log('Verification URL:', verificationUrl);
    console.log('========================================');
    return { success: true, development: true };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Logic Crafts Connect" <noreply@logiccrafts.com>',
    to: email,
    subject: 'Password Reset - Logic Crafts Connect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Logic Crafts Connect</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </div>
          </div>
          <div class="footer">
            <p>2024 Logic Crafts Connect. Empowering Artisans, Connecting Communities.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  } else {
    // Log to console if no transporter configured
    console.log('========================================');
    console.log('PASSWORD RESET EMAIL (Development Mode)');
    console.log('========================================');
    console.log('To:', email);
    console.log('Name:', name);
    console.log('Reset URL:', resetUrl);
    console.log('========================================');
    return { success: true, development: true };
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (email, name, order) => {
  const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/orders/${order.id}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Logic Crafts Connect" <noreply@logiccrafts.com>',
    to: email,
    subject: `Order Confirmation #${order.id} - Logic Crafts Connect`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f3f4f6; padding: 10px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Thank you for your order, ${name}!</h2>
            <p>Your order <strong>#${order.id}</strong> has been confirmed and is being processed.</p>
            
            <h3>Order Details</h3>
            <p><strong>Total:</strong> Rs. ${order.total}</p>

            <p style="text-align: center;">
              <a href="${orderUrl}" class="button">View Order Details</a>
            </p>
          </div>
          <div class="footer">
            <p>2024 Logic Crafts Connect. Empowering Artisans, Connecting Communities.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  } else {
    console.log('========================================');
    console.log('ORDER CONFIRMATION EMAIL (Development Mode)');
    console.log('========================================');
    console.log('To:', email);
    console.log('Order ID:', order.id);
    console.log('Total: Rs.', order.total);
    console.log('========================================');
    return { success: true, development: true };
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  generateVerificationToken,
  generateResetToken,
};

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sequelize = require('../../../config/db.config');

const mdl_UserCredentials = require('./user_creds.mdl');
const UserSessionsService = require('../user_sessions/user_sessions.srv');

const nodemailer = require('../../utils/nodemailer.utils');
const EmailTemplate = require('../../utils/email_template.utils');

class UserCredsService extends UserSessionsService {
  constructor() {
    super();
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.register = this.register.bind(this);
    this.generateOtp = this.generateOtp.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
  }

  async login(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { email, password } = req.body;

      // Validate inputs
      if (!email || !password) {
        throw new Error('Either username or email is required along with password.');
      }

      // Find user record
      const user = await mdl_UserCredentials.findOne({ where: { email: email } }, { transaction });
      if (!user) throw new Error('User not found');

      // Validate password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) throw new Error('Invalid password');

      // Validate user status
      if (!user.is_active) throw new Error('Email not verified. Please verify your email before logging in.');
      if (!user.is_verified) throw new Error('User not active. Please contact the administrator.');

      // Prepare user payload for token generation
      const userPayload = {
        user_id: user.user_id,
        email: user.email,
        acc_type: user.acc_type
      };

      // Generate tokens using inherited methods
      const accessToken = super.f_generateAccessToken(userPayload);
      const refreshToken = super.f_generateRefreshToken(userPayload);

      // Create session record
      const user_session = await super.createSession(userPayload.user_id, req, transaction);

      // Commit DB Transaction
      await transaction.commit();

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        message: 'Login successful',
        accessToken,
        sessionId: user_session.session_id,
        user: userPayload
      };
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async refresh(req, res) {
    try {
      // Extract refresh token from cookies
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) throw new Error('No refresh token provided.');

      // Verify refresh token
      const decoded = super.f_verifyRefreshToken(refreshToken);
      if (!decoded || !decoded.user_id) {
        throw new Error('Invalid or expired refresh token.');
      }

      // Ensure user still exists and is active
      const user = await mdl_UserCredentials.findOne({
        where: { user_id: decoded.user_id, is_active: true, is_verified: true },
      });
      if (!user) throw new Error('User not found or inactive.');

      // 4Recreate the payload
      const userPayload = {
        user_id: user.user_id,
        email: user.email,
        acc_type: user.acc_type,
      };

      // Generate new tokens
      const newAccessToken = super.f_generateAccessToken(userPayload);

      // Return the new access token
      return {
        message: 'Token refreshed successfully.',
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async register({ email, password, acc_type = 'system' }) {
    try {
      if (!email || !password) throw new Error('Email and password are required');
      const hashedPassword = await bcrypt.hash(password, 10);

      // create user
      const newUser = await mdl_UserCredentials.create({
        email,
        password: hashedPassword,
        acc_type
      });

      // render HTML email
      const { html: welcomeHtml, subject: welcomeSubject } =
        await EmailTemplate.as_renderAll("welcome_user", {
          user: newUser,
          subject: "Welcome to Sales Training and Recruitment from Philproperties",
        });

      // send email
      await nodemailer.sendEmail({
        to: email,
        subject: welcomeSubject,
        html: welcomeHtml,
      });

      return {
        message: "User registered. Kindly verify your email to access other services."
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async generateOtp(email) {
    try {
      if (!email) throw new Error('Email is required');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Invalid email format');

      // Fetch the user to ensure they exist and include in the email
      const existing_user = await mdl_UserCredentials.findOne({ where: { email } });
      if (!existing_user) throw new Error('User not found');

      const otp = crypto.randomInt(100000, 999999).toString();

      const { html: otpHtml, subject: otpSubject } =
        await EmailTemplate.as_renderAll("generate_otp", {
          user: existing_user,
          subject: "Verify your Email for Sales Training and Recruitment System - Philproperties",
          otp
        });

      await nodemailer.sendEmail({
        to: email,
        subject: otpSubject,
        html: otpHtml,
      });

      const token = super.f_generateAccessToken({ email, otp }, '5m');
      return { message: 'New OTP generated and sent to your email. Use the token for verification.', token };
    } catch (error) {
      throw new Error(`OTP generation failed: ${error.message}`);
    }
  }

  async verifyOtp(email, otp, tokenPayload) {
    try {
      if (!email || !otp) throw new Error('Email and OTP are required');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Invalid email format');

      if (!tokenPayload) throw new Error('Missing token payload');
      if (tokenPayload.email !== email) throw new Error('Invalid token for this email');

      // Compare provided OTP with token payload
      if (String(tokenPayload.otp) !== String(otp)) {
        throw new Error('OTP does not match');
      }

      const verify_user = await mdl_UserCredentials.findOne({ where: { email } });
      if (!verify_user) throw new Error('User not found');

      if (verify_user.verified) return { message: 'Email already verified', verify_user };

      await verify_user.update({ is_verified: true });
      const { html: verifyHtml, subject: verifySubject } =
        await EmailTemplate.as_renderAll("verified_user", {
          user: verify_user,
          subject: "Congratulations! You are now verified for Sales Training and Recruitment System - Philproperties",
        });

      await nodemailer.sendEmail({
        to: email,
        subject: verifySubject,
        html: verifyHtml,
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }

  // LOGOUT
  async logout(req, res) {
    const transaction = await sequelize.transaction();

    try {
      // Get Session ID
      const { sessionId } = req.body;
      if (!sessionId) throw new Error('Session ID is required for logout.');

      // Get refresh token from cookies
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) throw new Error('No refresh token found.');

      // Delete session record from database
      await this.endSession(sessionId, req, transaction);

      // Commit DB Transaction
      await transaction.commit();

      // Clear the refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });

      // Return confirmation
      return {
        message: 'Logout successful. Session ended.',
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Logout failed: ${error.message}`);
    }
  }
  // -- END OF LOGOUT

  // Set for debugging yet :)
  async deleteUser(email) {
    try {
      if (!email) throw new Error('Email is required');
      const user = await mdl_UserCredentials.findOne({ where: { email } });
      if (!user) throw new Error('User not found');
      await user.destroy();
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`User deletion failed: ${error.message}`);
    }
  }
}

module.exports = new UserCredsService();

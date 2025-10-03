const mdl_UserCredentials = require('./user_creds.mdl');
const bcrypt = require('bcrypt');
const nodemailer = require('../../utils/nodemailer.utils');
const EmailTemplate = require('../../utils/email_template.utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class UserCredsService {
  constructor() {
    this.register = this.register.bind(this);
    this.generateOtp = this.generateOtp.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
  }

  async register({ email, password, acc_type = 'System' }) {
    try {
      if (!email || !password) throw new Error('Email and password are required');
      const hashedPassword = await bcrypt.hash(password, 10);

      // create user
      const newUser = await mdl_UserCredentials.create({
        email,
        password: hashedPassword,
        acc_type,
        is_active: false,
      });

      // render HTML email
      const { html: welcomeHtml, subject: welcomeSubject } =
        await EmailTemplate.as_renderAll("welcome_user", {
          user: newUser,
          subject: "Welcome to our system!",
        });

      // send email
      await nodemailer.sendEmail({
        to: email,
        subject: welcomeSubject,
        html: welcomeHtml,
      });

      return {
        message: "User registered. Kindly verify your email to access other services.",
        user: newUser,
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
      const user = await mdl_UserCredentials.findOne({ where: { email } });
      if (!user) throw new Error('User not found');

      const otp = crypto.randomInt(100000, 999999).toString();

      const { html, text, subject } = await EmailTemplate.as_renderAll('generate_otp', { user, otp });
      await nodemailer.C_Mail({ to: email, subject, html, text });

      const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: '5m' });

      return { message: 'New OTP generated and sent to your email. Use the token for verification.', email, token };
    } catch (error) {
      throw new Error(`OTP generation failed: ${error.message}`);
    }
  }

  async verifyOtp(email, token) {
    try {
      if (!email || !token) throw new Error('Email and token are required');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Invalid email format');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.email !== email) throw new Error('Invalid token for this email');

      const user = await mdl_UserCredentials.findOne({ where: { email } });
      if (!user) throw new Error('User not found');

      if (user.is_active) return { message: 'Email already verified', user };

      await user.update({ is_active: true });

      const { html, text, subject } = await EmailTemplate.as_renderAll('verify_otp', { user });
      await nodemailer.C_Mail({ to: email, subject, html, text });

      return { message: 'Email verified successfully', user };
    } catch (error) {
      if (error.name === 'TokenExpiredError') throw new Error('Token has expired');
      if (error.name === 'JsonWebTokenError') throw new Error('Invalid token');
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }

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

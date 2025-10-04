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

      const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: '5m' });
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

      await verify_user.update({ verified: true });
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

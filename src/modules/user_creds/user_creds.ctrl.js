// src/modules/user_creds/user_creds.ctrl.js
const UserCredsService = require('./user_creds.srv');

class UserCredsController {
  constructor() {
    this.service = UserCredsService;
    this.as_register = this.as_register.bind(this);
    this.as_generateOtp = this.as_generateOtp.bind(this);
    this.as_verifyOtp = this.as_verifyOtp.bind(this);
  }

  async as_register(req, res) {
    const { email, password, acc_type } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const result = await this.service.register({ email, password, acc_type });
    res.status(201).json(result);
  }

  async as_generateOtp(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const result = await this.service.generateOtp(email);
    res.status(200).json(result);
  }

  async as_verifyOtp(req, res) {
    const { email, token } = req.body;
    if (!email || !token) return res.status(400).json({ error: 'Email and token are required' });
    const result = await this.service.verifyOtp(email, token);
    res.status(200).json(result);
  }
}

module.exports = new UserCredsController();

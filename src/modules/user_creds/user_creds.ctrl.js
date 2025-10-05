const UserCredsService = require('./user_creds.srv');

class UserCredsController {
  constructor() {
    this.service = UserCredsService;
    this.as_login = this.as_login.bind(this);
    this.as_refresh = this.as_refresh.bind(this);
    this.as_logout = this.as_logout.bind(this);
    this.as_register = this.as_register.bind(this);
    this.as_generateOtp = this.as_generateOtp.bind(this);
    this.as_verifyOtp = this.as_verifyOtp.bind(this);
    this.as_deleteUser = this.as_deleteUser.bind(this);
  }

  // LOGIN
  async as_login(req, res) {
    try {
      const result = await this.service.login(req, res);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
  // -- END OF LOGIN

  // REFRESH
  async as_refresh(req, res) {
    try {
      const result = await this.service.refresh(req, res);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
  // -- END OF REFRESH

  // LOGOUT
  async as_logout(req, res) {
    try {
      const result = await this.service.logout(req, res);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
  // -- END OF LOGOUT

  // REGISTER CREDENTIAL
  async as_register(req, res) {
    const { email, password, acc_type } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const result = await this.service.register({ email, password, acc_type });
    res.status(201).json(result);
  }
  // -- END OF REGISTER CREDENTIAL

  // VERIFY CREDENTIAL
  async as_generateOtp(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const result = await this.service.generateOtp(email);
    res.status(200).json(result);
  }

  async as_verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      const decoded = req.user;
      const result = await UserCredsService.verifyOtp(email, otp, decoded);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
  // -- END OF VERIFY CREDENTIAL

  // DELETE USER
  async as_deleteUser(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const result = await this.service.deleteUser(email);
    res.status(200).json(result);
  }
  // -- END OF DELETE USER
}

module.exports = new UserCredsController();

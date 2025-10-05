const { Router } = require('express');
const f_authMiddleware = require('../../middlewares/auth.mw');
const UserCredsController = require('./user_creds.ctrl');

const router = Router();

router.post('/login', UserCredsController.as_login);
router.post('/logout', UserCredsController.as_logout);
router.post('/refresh', UserCredsController.as_refresh);
router.post('/register', UserCredsController.as_register);
router.post('/generate-otp', UserCredsController.as_generateOtp);
router.post('/verify', f_authMiddleware, UserCredsController.as_verifyOtp);
router.delete('/delete-user', UserCredsController.as_deleteUser);

// Middleware added
// router.get('/profile', f_authMiddleware, (req, res) => res.json({ message: 'Protected user profile', user: req.user }));

module.exports = router;

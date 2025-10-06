/***********************************************************************************************************************************************************************
* File Name: user_creds.rt.js
* Type of Program: Router
* Description: Router for user credentials management
* Module: User Credentials
* Author: rgrgogu
* Date Created: Oct. 6, 2025
***********************************************************************************************************************************************************************
* Change History:
* DATE                AUTHOR            LOG NUMBER     DESCRIPTION                                                      
* Oct. 6, 2025        rgrgogu           001            Initial creation - STAR Phase 1 Project
***********************************************************************************************************************************************************************/
const { Router } = require('express');
const f_authMiddleware = require('../../middlewares/auth.mw');
const UserCredsController = require('./user_creds.ctrl');

const router = Router();

// Non-protected routes
router.post('/login', UserCredsController.as_login);
router.post('/logout', UserCredsController.as_logout);
router.post('/refresh', UserCredsController.as_refresh);
router.post('/register', UserCredsController.as_register);
router.post('/generate-otp', UserCredsController.as_generateOtp);

// Protected route with auth middleware
router.post('/verify', f_authMiddleware, UserCredsController.as_verifyOtp);
router.delete('/delete-user', f_authMiddleware, UserCredsController.as_deleteUser);

module.exports = router;

/***********************************************************************************************************************************************************************
* File Name: user_sessions.rt.js
* Type of Program: Router
* Description: Router for user sessions management
* Module: User Sessions
* Author: rgrgogu
* Date Created: Oct. 6, 2025
***********************************************************************************************************************************************************************
* Change History:
* DATE                AUTHOR            LOG NUMBER     DESCRIPTION                                                      
* Oct. 6, 2025        rgrgogu           001            Initial creation - STAR Phase 1 Project
***********************************************************************************************************************************************************************/
const { Router } = require('express');
const authMiddleware = require('../../../middleware/auth.mw');
const UserSessionsController = require('./UserSessions.ctrl');

const router = Router();

// router.post('/login', UserSessionsController.as_login);
// router.post('/refresh', UserSessionsController.as_refreshToken);
// router.post('/logout', authMiddleware, UserSessionsController.as_logout);
// router.delete('/cleanup', authMiddleware, UserSessionsController.as_cleanupExpiredSessions);

module.exports = router;
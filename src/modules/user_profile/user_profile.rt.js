/***********************************************************************************************************************************************************************
* File Name: user_profile.rt.js
* Type of Program: Router
* Description: Router for user profile management
* Module: User Profile
* Author: rgrgogu
* Date Created: Oct. 6, 2025
***********************************************************************************************************************************************************************
* Change History:
* DATE                AUTHOR            LOG NUMBER     DESCRIPTION                                                      
* Oct. 6, 2025        rgrgogu           001            Initial creation - STAR Phase 1 Project
***********************************************************************************************************************************************************************/
const { Router } = require('express');
const f_authMiddleware = require('../../middlewares/auth.mw');
const UserProfileController = require('./user_profile.ctrl');

const router = Router();

// Protected routes
router.get('/user/:user_id', f_authMiddleware, UserProfileController.as_getUserProfile);
router.post('/', f_authMiddleware, UserProfileController.as_createUserProfile);
router.put('/:user_id', f_authMiddleware, UserProfileController.as_updateUserProfile);
router.delete('/:user_id', f_authMiddleware, UserProfileController.as_deleteUserProfile);

module.exports = router;

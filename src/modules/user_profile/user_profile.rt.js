const { Router } = require('express');
const UserProfileController = require('./user_profile.ctrl');

const router = Router();

router.get('/user/:user_id', UserProfileController.as_getUserProfile);
router.post('/', UserProfileController.as_createUserProfile);
router.put('/:user_id', UserProfileController.as_updateUserProfile);
router.delete('/:user_id', UserProfileController.as_deleteUserProfile);

module.exports = router;

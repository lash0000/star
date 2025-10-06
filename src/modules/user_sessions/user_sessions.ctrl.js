/***********************************************************************************************************************************************************************
* File Name: user_sessions.ctrl.js
* Type of Program: Controller
* Description: User Sessions Controller
* Module: User Sessions
* Author: rgrgogu
* Date Created: Oct. 6, 2025
***********************************************************************************************************************************************************************
* Change History:
* DATE                AUTHOR            LOG NUMBER     DESCRIPTION                                                      
* Oct. 6, 2025        rgrgogu           001            Initial creation - STAR Phase 1 Project
***********************************************************************************************************************************************************************/
const UserSessionsService = require('./user_sessions.srv');

class UserSessionsController {
  constructor() {
    // Initialize the service
    this.service = UserSessionsService;

    // Bind methods to the class instance
  }

  /*
  * Method: 
  * Description: 
  * Route: 
  * Params: 
  * Body: 
  * Response: 
  * Authorization: 
  */
}

module.exports = new UserSessionsController();
/***********************************************************************************************************************************************************************
* File Name: routes_v1.util.js
* Type of Program: Utility
* Description: Utility controller for versioning routes handler 
* Module: Route Handler
* Author: rgrgogu
* Date Created: Oct. 6, 2025
***********************************************************************************************************************************************************************
* Change History:
* DATE                AUTHOR            LOG NUMBER     DESCRIPTION                                                      
* Oct. 6, 2025        rgrgogu           001            Initial creation - STAR Phase 1 Project
***********************************************************************************************************************************************************************/

// This locates our root handler for routes.
const express = require('express');
const userCredsRoutes = require('../modules/user_creds/user_creds.rt');
const userProfileRoutes = require('../modules/user_profile/user_profile.rt');

class mainRoutes {
  constructor() {
    this.router = express.Router();
    this.registerRoutes(this.router);
  }

  registerRoutes(router) {
    router.use('/user-creds', userCredsRoutes);
    router.use('/profile', userProfileRoutes);
  }

  getRouter() {
    return this.router;
  }
}

module.exports = new mainRoutes().getRouter();

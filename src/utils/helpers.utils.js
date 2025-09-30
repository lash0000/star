// This locates our root handler for routes.

const { Router } = require('express');
const jwt = require('jsonwebtoken');

class Routes {
  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/generate-otp', userAuthController.generateOTP);

  }

  getRouter() {
    return this.router;
  }
}

module.exports = new Routes().getRouter();

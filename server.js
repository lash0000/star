/***********************************************************************************************************************************************************************
* File Name: server.js
* Type of Program: Root Application
* Description: Root handler for serverless framework application
* Module: App
* Author: rgrgogu
* Date Created: Oct. 6, 2025
***********************************************************************************************************************************************************************
* Change History:
* DATE                AUTHOR            LOG NUMBER     DESCRIPTION                                                      
* Oct. 6, 2025        rgrgogu           001            Initial creation - STAR Phase 1 Project
* Oct 29, 2025        lash0000          002            Initial creation - Migrate to Azure Functions
***********************************************************************************************************************************************************************/

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes_v1 = require('./src/utils/routes_v1.utils');
const sequelize = require('./config/db.config');

dotenv.config();
const app = express();

app.set('trust proxy', 1);

// JSON Payload
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: "",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
app.use(cookieParser());

// Load all
app.use('/api/v1/data', routes_v1);

// Main route
app.get('/', (req, res) => {
  res.json({
    project_name: "Sales Training and Recruitment System by Philproperties",
    project_overview: "It is a stateless architecture with REST principle including Sequelize, Nodemailer and Azure Functions",
    version: "0xx",
    description: "A REST API method for STAR online courses product.",
    available_routes: [
      "/api/v1/data/xxx"
    ]
  });
});

const db_postgres_connection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database is connected YAAY');
  } catch (error) {
    console.error('Database connection error:', err);
    setTimeout(C_Postgres, 5000);
  }
}
db_postgres_connection();

// Start server (Azure & local friendly)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

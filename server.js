const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const serverless = require('serverless-http');
const mainRoutes = require('./src/utils/helpers.utils');
const sequelize = require('./config/db.config');

dotenv.config();
const o_app = express();

// JSON Payload
o_app.use(express.json({ limit: '10mb' }));
o_app.use(express.urlencoded({ extended: true, limit: '10mb' }));
o_app.use(cors());

// Load all
o_app.use('/api/v1/data', mainRoutes);

// Main route
o_app.get('/', (req, res) => {
  res.json({
    project_name: "Sales Training and Recruitment System by Philproperties",
    project_overview: "Serverless architecture via REST with Sequelize, Nodemailer, ElastiCache, EC2 and S3",
    source_code: "https://github.com/lash0000/star",
    version: "0xx",
    api_base_url: "/api/v1/data/{route}",
    description: "A REST API method for STAR product.",
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

// Export handler for Serverless
module.exports.handler = serverless(o_app);

if (require.main === module) {
  const CFG_PORT = process.env.PORT || 3000;
  o_app.listen(CFG_PORT, () => {
    console.log(`Server running on port ${CFG_PORT}`);
  });
}

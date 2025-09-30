const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const serverless = require('serverless-http');

dotenv.config();
const app = express();

// JSON Payload
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Main route
app.get('/', (req, res) => {
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

// Export handler for Serverless
module.exports.handler = serverless(app);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    await redisClient.quit();
    process.exit(0);
  });
}

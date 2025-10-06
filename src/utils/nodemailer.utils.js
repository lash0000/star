/***********************************************************************************************************************************************************************
* File Name: nodemailer.utils.js
* Type of Program: Utility
* Description: Service utility for Nodemailer.
* Module: Email Service
* Author: lash0000
* Date Created: Oct. 6, 2025
***********************************************************************************************************************************************************************
* Change History:
* DATE                AUTHOR            LOG NUMBER     DESCRIPTION                                                      
* Oct. 6, 2025        lash0000          001            Initial creation - STAR Phase 1 Project
***********************************************************************************************************************************************************************/

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_SERVICE,
    pass: process.env.SMTP_APP,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Transporter Error:", error);
  } else {
    console.log("SMTP Transporter Ready");
  }
});

const sendEmail = async (options) => {
  const { to, subject, html } = options;

  try {
    const result = transporter.sendMail({
      from: {
        name: "Philproperties",
        address: process.env.SMTP_SERVICE,
      },
      to,
      subject,
      html,
    });

    return result;
  } catch (err) {
    throw new Error(`Email sending failed: ${err.message}`);
  }
};

module.exports = { transporter, sendEmail };

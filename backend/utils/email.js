const nodemailer = require('nodemailer');
const { emailConfig } = require('../config/variables.config');

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: false,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: emailConfig.from,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
}; 
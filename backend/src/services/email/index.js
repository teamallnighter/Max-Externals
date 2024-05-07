const config = require('../../config');
const assert = require('assert');
const nodemailer = require('nodemailer');

module.exports = class EmailSender {
  constructor(email) {
    this.email = email;
  }

  async send() {
    assert(this.email, 'email is required');
    assert(this.email.to, 'email.to is required');
    assert(this.email.subject, 'email.subject is required');
    assert(this.email.html, 'email.html is required');

    const htmlContent = await this.email.html();

    const transporter = nodemailer.createTransport(this.transportConfig);

    const mailOptions = {
      from: this.from,
      to: this.email.to,
      subject: this.email.subject,
      html: htmlContent,
    };

    return transporter.sendMail(mailOptions);
  }

  static get isConfigured() {
    return !!config.email?.auth?.pass && !!config.email?.auth?.user;
  }

  get transportConfig() {
    return config.email;
  }

  get from() {
    return config.email.from;
  }
};

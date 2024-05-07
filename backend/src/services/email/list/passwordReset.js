const { getNotification } = require('../../notifications/helpers');
const path = require('path');
const { promises: fs } = require('fs');

module.exports = class PasswordResetEmail {
  constructor(to, link) {
    this.to = to;
    this.link = link;
  }

  get subject() {
    return getNotification(
      'emails.passwordReset.subject',
      getNotification('app.title'),
    );
  }

  async html() {
    try {
      const templatePath = path.join(
        __dirname,
        '../../email/htmlTemplates/passwordReset/passwordResetEmail.html',
      );

      const template = await fs.readFile(templatePath, 'utf8');

      const appTitle = getNotification('app.title');
      const resetUrl = this.link;
      const accountName = this.to;

      let html = template
        .replace(/{appTitle}/g, appTitle)
        .replace(/{resetUrl}/g, resetUrl)
        .replace(/{accountName}/g, accountName);

      return html;
    } catch (error) {
      console.error('Error generating invitation email HTML:', error);
      throw error;
    }
  }
};

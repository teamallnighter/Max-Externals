const { getNotification } = require('../../notifications/helpers');
const fs = require('fs').promises;
const path = require('path');

module.exports = class EmailAddressVerificationEmail {
  constructor(to, link) {
    this.to = to;
    this.link = link;
  }

  get subject() {
    return getNotification(
      'emails.emailAddressVerification.subject',
      getNotification('app.title'),
    );
  }

  async html() {
    try {
      const templatePath = path.join(
        __dirname,
        '../../email/htmlTemplates/addressVerification/emailAddressVerification.html',
      );

      const template = await fs.readFile(templatePath, 'utf8');

      const appTitle = getNotification('app.title');
      const signupUrl = this.link;

      let html = template
        .replace(/{appTitle}/g, appTitle)
        .replace(/{signupUrl}/g, signupUrl)
        .replace(/{to}/g, this.to);

      return html;
    } catch (error) {
      console.error('Error generating invitation email HTML:', error);
      throw error;
    }
  }
};

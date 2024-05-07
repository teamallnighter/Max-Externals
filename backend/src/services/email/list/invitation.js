const fs = require('fs').promises;
const path = require('path');
const { getNotification } = require('../../notifications/helpers');

module.exports = class InvitationEmail {
  constructor(to, host) {
    this.to = to;
    this.host = host;
  }

  get subject() {
    return getNotification(
      'emails.invitation.subject',
      getNotification('app.title'),
    );
  }

  async html() {
    try {
      const templatePath = path.join(
        __dirname,
        '../../email/htmlTemplates/invitation/invitationTemplate.html',
      );

      const template = await fs.readFile(templatePath, 'utf8');

      const appTitle = getNotification('app.title');
      const signupUrl = `${this.host}&invitation=true`;

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

const axios = require('axios');
const { v4: uuid } = require('uuid');
const RoleService = require('./roles');
const config = require('../config');

module.exports = class OpenAiService {
  static async getWidget(payload, userId, roleId) {
    const response = await axios.post(
      `${config.flHost}/${config.project_uuid}/project_customization_widgets.json`,
      payload,
    );

    if (response.status >= 200 && response.status < 300) {
      const { widget_id } = await response.data;
      await RoleService.addRoleInfo(roleId, userId, 'widgets', widget_id);
      return widget_id;
    } else {
      console.error('=======error=======', response.data);
      return { value: null, error: response.data };
    }
  }
};

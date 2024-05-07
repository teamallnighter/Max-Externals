const db = require('../db/models');
const RolesDBApi = require('../db/api/roles');
const processFile = require('../middlewares/upload');
const ValidationError = require('./notifications/errors/validation');
const csv = require('csv-parser');
const axios = require('axios');
const config = require('../config');
const stream = require('stream');

function buildWidgetResult(widget, queryResult, queryString) {
  if (queryResult[0] && queryResult[0].length) {
    const key = Object.keys(queryResult[0][0])[0];
    const value =
      widget.widget_type === 'scalar' ? queryResult[0][0][key] : queryResult[0];
    const widgetData = JSON.parse(widget.data);
    return { ...widget, ...widgetData, value, query: queryString };
  } else {
    return { ...widget, value: [], query: queryString };
  }
}

async function executeQuery(queryString, currentUser) {
  try {
    return await db.sequelize.query(queryString, {
      replacements: { organizationId: currentUser.organizationId },
    });
  } catch (e) {
    console.log(e);
    return [];
  }
}

function insertWhereConditions(queryString, whereConditions) {
  if (!whereConditions) return queryString;

  const whereIndex = queryString.toLowerCase().indexOf('where');
  const groupByIndex = queryString.toLowerCase().indexOf('group by');
  const insertIndex =
    whereIndex === -1
      ? groupByIndex !== -1
        ? groupByIndex
        : queryString.length
      : whereIndex + 5;

  const prefix = queryString.substring(0, insertIndex);
  const suffix = queryString.substring(insertIndex);
  const conditionString =
    whereIndex === -1
      ? ` WHERE ${whereConditions} `
      : ` ${whereConditions} AND `;

  return `${prefix}${conditionString}${suffix}`;
}

function constructWhereConditions(mainTable, currentUser, replacements) {
  const {
    organizationId,
    app_role: { globalAccess },
  } = currentUser;
  const tablesWithoutOrgId = ['permissions', 'roles'];
  let whereConditions = '';

  if (!globalAccess && !tablesWithoutOrgId.includes(mainTable)) {
    whereConditions += `"${mainTable}"."organizationId" = :organizationId`;
    replacements.organizationId = organizationId;
  }

  if (mainTable !== 'users') {
    whereConditions += whereConditions ? ' AND ' : '';
    whereConditions += `"${mainTable}"."deletedAt" IS NULL`;
  }

  return whereConditions;
}

function extractTableName(queryString) {
  const tableNameRegex = /FROM\s+("?)([^"\s]+)\1\s*/i;
  const match = tableNameRegex.exec(queryString);
  return match ? match[2] : null;
}

function buildQueryString(widget, currentUser) {
  let queryString = widget?.query || '';
  const tableName = extractTableName(queryString);
  const mainTable = JSON.parse(widget?.data)?.main_table || tableName;
  const replacements = {};
  const whereConditions = constructWhereConditions(
    mainTable,
    currentUser,
    replacements,
  );
  queryString = insertWhereConditions(queryString, whereConditions);
  console.log(queryString, 'queryString');
  return queryString;
}

async function constructWidgetsResults(widgets, currentUser) {
  const widgetsResults = [];
  for (const widget of widgets) {
    if (!widget) continue;
    const queryString = buildQueryString(widget, currentUser);
    const queryResult = await executeQuery(queryString, currentUser);
    widgetsResults.push(buildWidgetResult(widget, queryResult, queryString));
  }
  return widgetsResults;
}

async function fetchWidgetsData(widgets) {
  const widgetPromises = widgets.map((widgetId) =>
    axios.get(
      `${config.flHost}/${config.project_uuid}/project_customization_widgets/${widgetId}.json`,
    ),
  );
  const widgetResults = widgetPromises
    ? await Promise.allSettled(widgetPromises)
    : [];
  return widgetResults
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value.data);
}

async function processWidgets(widgets, currentUser) {
  const widgetData = await fetchWidgetsData(widgets);
  return constructWidgetsResults(widgetData, currentUser);
}

function parseCustomization(role) {
  try {
    return JSON.parse(role.role_customization || '{}');
  } catch (e) {
    console.log(e);
    return {};
  }
}

async function findRole(roleId, currentUser) {
  const transaction = await db.sequelize.transaction();
  try {
    const role = roleId
      ? await RolesDBApi.findBy({ id: roleId }, { transaction })
      : await RolesDBApi.findBy({ name: 'User' }, { transaction });
    await transaction.commit();
    return role;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = class RolesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await RolesDBApi.create(data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async bulkImport(req, res, sendInvitationEmails = true, host) {
    const transaction = await db.sequelize.transaction();

    try {
      await processFile(req, res);
      const bufferStream = new stream.PassThrough();
      const results = [];

      await bufferStream.end(Buffer.from(req.file.buffer, 'utf-8')); // convert Buffer to Stream

      await new Promise((resolve, reject) => {
        bufferStream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', async () => {
            console.log('CSV results', results);
            resolve();
          })
          .on('error', (error) => reject(error));
      });

      await RolesDBApi.bulkImport(results, {
        transaction,
        ignoreDuplicates: true,
        validate: true,
        currentUser: req.currentUser,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let roles = await RolesDBApi.findBy({ id }, { transaction });

      if (!roles) {
        throw new ValidationError('rolesNotFound');
      }

      await RolesDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return roles;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      await RolesDBApi.remove(id, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async addRoleInfo(roleId, userId, key, widgetId, currentUser) {
    const regexExpForUuid =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    const widgetIdIsUUID = regexExpForUuid.test(widgetId);

    const transaction = await db.sequelize.transaction();
    let role;
    if (roleId) {
      role = await RolesDBApi.findBy({ id: roleId }, { transaction });
    } else {
      role = await RolesDBApi.findBy({ name: 'User' }, { transaction });
    }

    if (!role) {
      throw new ValidationError('rolesNotFound');
    }

    try {
      let customization = {};
      try {
        customization = JSON.parse(role.role_customization || '{}');
      } catch (e) {
        console.log(e);
      }

      if (widgetIdIsUUID && Array.isArray(customization[key])) {
        const el = customization[key].find((e) => e === widgetId);
        !el ? customization[key].unshift(widgetId) : null;
      }

      if (widgetIdIsUUID && !customization[key]) {
        customization[key] = [widgetId];
      }

      const newRole = await RolesDBApi.update(
        role.id,
        {
          role_customization: JSON.stringify(customization),
          name: role.name,
          permissions: role.permissions,
        },
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();

      return newRole;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async removeRoleInfoById(infoId, roleId, key, currentUser) {
    const transaction = await db.sequelize.transaction();

    let role;
    if (roleId) {
      role = await RolesDBApi.findBy({ id: roleId }, { transaction });
    } else {
      role = await RolesDBApi.findBy({ name: 'User' }, { transaction });
    }
    if (!role) {
      await transaction.rollback();
      throw new ValidationError('rolesNotFound');
    }

    let customization = {};
    try {
      customization = JSON.parse(role.role_customization || '{}');
    } catch (e) {
      console.log(e);
    }

    customization[key] = customization[key].filter((item) => item !== infoId);

    const response = await axios.delete(
      `${config.flHost}/${config.project_uuid}/project_customization_widgets/${infoId}.json`,
    );
    const { status } = await response;
    try {
      const result = await RolesDBApi.update(
        role.id,
        {
          role_customization: JSON.stringify(customization),
          name: role.name,
          permissions: role.permissions,
        },
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getRoleInfoByKey(key, roleId, currentUser) {
    const transaction = await db.sequelize.transaction();

    const organizationId = currentUser.organizationId;
    let globalAccess = currentUser.app_role?.globalAccess;
    let queryString = '';

    let role;
    try {
      if (roleId) {
        role = await RolesDBApi.findBy({ id: roleId }, { transaction });
      } else {
        role = await RolesDBApi.findBy({ name: 'User' }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    let customization = '{}';

    try {
      customization = JSON.parse(role.role_customization || '{}');
    } catch (e) {
      console.log(e);
    }

    if (key === 'widgets') {
      const widgets = customization[key] || [];
      const widgetArray = widgets.map((widget) => {
        return axios.get(
          `${config.flHost}/${config.project_uuid}/project_customization_widgets/${widget}.json`,
        );
      });
      const widgetResults = await Promise.allSettled(widgetArray);

      const fulfilledWidgets = widgetResults.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value.data;
        }
      });

      const widgetsResults = [];

      if (Array.isArray(fulfilledWidgets)) {
        for (const widget of fulfilledWidgets) {
          let result = [];
          try {
            result = await db.sequelize.query(widget.query);
          } catch (e) {
            console.log(e);
          }

          if (result[0] && result[0].length) {
            const key = Object.keys(result[0][0])[0];
            const value =
              widget.widget_type === 'scalar' ? result[0][0][key] : result[0];
            const widgetData = JSON.parse(widget.data);
            widgetsResults.push({ ...widget, ...widgetData, value });
          } else {
            widgetsResults.push({ ...widget, value: null });
          }
        }
      }
      return widgetsResults;
    }
    return customization[key];
  }
};

const db = require('../db/models');
const ValidationError = require('./notifications/errors/validation');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

/**
 * @param {string} permission
 * @param {object} currentUser
 */
async function checkPermissions(permission, currentUser) {
  if (!currentUser) {
    throw new ValidationError('auth.unauthorized');
  }

  const userPermission = currentUser.custom_permissions.find(
    (cp) => cp.name === permission,
  );

  if (userPermission) {
    return true;
  }

  try {
    if (!currentUser.app_role) {
      throw new ValidationError('auth.forbidden');
    }

    const permissions = await currentUser.app_role.getPermissions();

    return !!permissions.find((p) => p.name === permission);
  } catch (e) {
    throw e;
  }
}

module.exports = class SearchService {
  static async search(searchQuery, currentUser) {
    try {
      if (!searchQuery) {
        throw new ValidationError('iam.errors.searchQueryRequired');
      }
      const tableColumns = {
        users: ['firstName', 'lastName', 'phoneNumber', 'email'],

        posts: ['title', 'content'],

        devices: ['title', 'description'],

        studios: ['name', 'description', 'externalwebsite'],
      };
      const columnsInt = {
        devices: ['price'],

        transactions: ['amount'],
      };

      let allFoundRecords = [];

      for (const tableName in tableColumns) {
        if (tableColumns.hasOwnProperty(tableName)) {
          const attributesToSearch = tableColumns[tableName];
          const attributesIntToSearch = columnsInt[tableName] || [];
          const whereCondition = {
            [Op.or]: [
              ...attributesToSearch.map((attribute) => ({
                [attribute]: {
                  [Op.iLike]: `%${searchQuery}%`,
                },
              })),
              ...attributesIntToSearch.map((attribute) =>
                Sequelize.where(
                  Sequelize.cast(
                    Sequelize.col(`${tableName}.${attribute}`),
                    'varchar',
                  ),
                  { [Op.iLike]: `%${searchQuery}%` },
                ),
              ),
            ],
          };

          const hasPermission = await checkPermissions(
            `READ_${tableName.toUpperCase()}`,
            currentUser,
          );
          if (!hasPermission) {
            continue;
          }

          const foundRecords = await db[tableName].findAll({
            where: whereCondition,
            attributes: [
              ...tableColumns[tableName],
              'id',
              ...attributesIntToSearch,
            ],
          });

          const modifiedRecords = foundRecords.map((record) => {
            const matchAttribute = [];

            for (const attribute of attributesToSearch) {
              if (
                record[attribute]
                  ?.toLowerCase()
                  ?.includes(searchQuery.toLowerCase())
              ) {
                matchAttribute.push(attribute);
              }
            }

            for (const attribute of attributesIntToSearch) {
              const castedValue = String(record[attribute]);
              if (
                castedValue &&
                castedValue.toLowerCase().includes(searchQuery.toLowerCase())
              ) {
                matchAttribute.push(attribute);
              }
            }

            return {
              ...record.get(),
              matchAttribute,
              tableName,
            };
          });

          allFoundRecords = allFoundRecords.concat(modifiedRecords);
        }
      }

      return allFoundRecords;
    } catch (error) {
      throw error;
    }
  }
};

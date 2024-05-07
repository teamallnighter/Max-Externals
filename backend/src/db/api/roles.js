const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class RolesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.create(
      {
        id: data.id || undefined,

        name: data.name || null,
        role_customization: data.role_customization || null,
        globalAccess: data.globalAccess || false,

        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await roles.setPermissions(data.permissions || [], {
      transaction,
    });

    return roles;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const rolesData = data.map((item, index) => ({
      id: item.id || undefined,

      name: item.name || null,
      role_customization: item.role_customization || null,
      globalAccess: item.globalAccess || false,

      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const roles = await db.roles.bulkCreate(rolesData, { transaction });

    // For each item created, replace relation files

    return roles;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.findByPk(id, {}, { transaction });

    await roles.update(
      {
        name: data.name || null,
        role_customization: data.role_customization || null,
        globalAccess: data.globalAccess || false,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await roles.setPermissions(data.permissions || [], {
      transaction,
    });

    return roles;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.findByPk(id, options);

    await roles.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await roles.destroy({
      transaction,
    });

    return roles;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const roles = await db.roles.findOne({ where }, { transaction });

    if (!roles) {
      return roles;
    }

    const output = roles.get({ plain: true });

    output.users_app_role = await roles.getUsers_app_role({
      transaction,
    });

    output.permissions = await roles.getPermissions({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.permissions,
        as: 'permissions',
        through: filter.permissions
          ? {
              where: {
                [Op.or]: filter.permissions.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.permissions ? true : null,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('roles', 'name', filter.name),
        };
      }

      if (filter.role_customization) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'roles',
            'role_customization',
            filter.role_customization,
          ),
        };
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.globalAccess) {
        where = {
          ...where,
          globalAccess: filter.globalAccess,
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }
    }

    let { rows, count } = options?.countOnly
      ? {
          rows: [],
          count: await db.roles.count({
            where,
            include,
            distinct: true,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            order:
              filter.field && filter.sort
                ? [[filter.field, filter.sort]]
                : [['createdAt', 'desc']],
            transaction,
          }),
        }
      : await db.roles.findAndCountAll({
          where,
          include,
          distinct: true,
          limit: limit ? Number(limit) : undefined,
          offset: offset ? Number(offset) : undefined,
          order:
            filter.field && filter.sort
              ? [[filter.field, filter.sort]]
              : [['createdAt', 'desc']],
          transaction,
        });

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('roles', 'name', query),
        ],
      };
    }

    const records = await db.roles.findAll({
      attributes: ['id', 'name'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['name', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.name,
    }));
  }
};

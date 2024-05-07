const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class DevicesDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const devices = await db.devices.create(
      {
        id: data.id || undefined,

        title: data.title || null,
        price: data.price || null,
        description: data.description || null,
        category: data.category || null,
        is_free: data.is_free || false,

        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await devices.setStudio(data.studio || null, {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.devices.getTableName(),
        belongsToColumn: 'images',
        belongsToId: devices.id,
      },
      data.images,
      options,
    );

    return devices;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const devicesData = data.map((item, index) => ({
      id: item.id || undefined,

      title: item.title || null,
      price: item.price || null,
      description: item.description || null,
      category: item.category || null,
      is_free: item.is_free || false,

      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const devices = await db.devices.bulkCreate(devicesData, { transaction });

    // For each item created, replace relation files

    for (let i = 0; i < devices.length; i++) {
      await FileDBApi.replaceRelationFiles(
        {
          belongsTo: db.devices.getTableName(),
          belongsToColumn: 'images',
          belongsToId: devices[i].id,
        },
        data[i].images,
        options,
      );
    }

    return devices;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const devices = await db.devices.findByPk(id, {}, { transaction });

    await devices.update(
      {
        title: data.title || null,
        price: data.price || null,
        description: data.description || null,
        category: data.category || null,
        is_free: data.is_free || false,

        updatedById: currentUser.id,
      },
      { transaction },
    );

    await devices.setStudio(data.studio || null, {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.devices.getTableName(),
        belongsToColumn: 'images',
        belongsToId: devices.id,
      },
      data.images,
      options,
    );

    return devices;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const devices = await db.devices.findByPk(id, options);

    await devices.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await devices.destroy({
      transaction,
    });

    return devices;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const devices = await db.devices.findOne({ where }, { transaction });

    if (!devices) {
      return devices;
    }

    const output = devices.get({ plain: true });

    output.transactions_product = await devices.getTransactions_product({
      transaction,
    });

    output.images = await devices.getImages({
      transaction,
    });

    output.studio = await devices.getStudio({
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
        model: db.studios,
        as: 'studio',
      },

      {
        model: db.file,
        as: 'images',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.title) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('devices', 'title', filter.title),
        };
      }

      if (filter.description) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('devices', 'description', filter.description),
        };
      }

      if (filter.priceRange) {
        const [start, end] = filter.priceRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            price: {
              ...where.price,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            price: {
              ...where.price,
              [Op.lte]: end,
            },
          };
        }
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

      if (filter.category) {
        where = {
          ...where,
          category: filter.category,
        };
      }

      if (filter.is_free) {
        where = {
          ...where,
          is_free: filter.is_free,
        };
      }

      if (filter.studio) {
        var listItems = filter.studio.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          studioId: { [Op.or]: listItems },
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
          count: await db.devices.count({
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
      : await db.devices.findAndCountAll({
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
          Utils.ilike('devices', 'title', query),
        ],
      };
    }

    const records = await db.devices.findAll({
      attributes: ['id', 'title'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['title', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.title,
    }));
  }
};

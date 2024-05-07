const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class TransactionsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const transactions = await db.transactions.create(
      {
        id: data.id || undefined,

        amount: data.amount || null,
        transaction_date: data.transaction_date || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await transactions.setBuyer(data.buyer || null, {
      transaction,
    });

    await transactions.setProduct(data.product || null, {
      transaction,
    });

    await transactions.setSeller(data.seller || null, {
      transaction,
    });

    return transactions;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const transactionsData = data.map((item, index) => ({
      id: item.id || undefined,

      amount: item.amount || null,
      transaction_date: item.transaction_date || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const transactions = await db.transactions.bulkCreate(transactionsData, {
      transaction,
    });

    // For each item created, replace relation files

    return transactions;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const transactions = await db.transactions.findByPk(
      id,
      {},
      { transaction },
    );

    await transactions.update(
      {
        amount: data.amount || null,
        transaction_date: data.transaction_date || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await transactions.setBuyer(data.buyer || null, {
      transaction,
    });

    await transactions.setProduct(data.product || null, {
      transaction,
    });

    await transactions.setSeller(data.seller || null, {
      transaction,
    });

    return transactions;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const transactions = await db.transactions.findByPk(id, options);

    await transactions.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await transactions.destroy({
      transaction,
    });

    return transactions;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const transactions = await db.transactions.findOne(
      { where },
      { transaction },
    );

    if (!transactions) {
      return transactions;
    }

    const output = transactions.get({ plain: true });

    output.buyer = await transactions.getBuyer({
      transaction,
    });

    output.product = await transactions.getProduct({
      transaction,
    });

    output.seller = await transactions.getSeller({
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
        model: db.users,
        as: 'buyer',
      },

      {
        model: db.devices,
        as: 'product',
      },

      {
        model: db.users,
        as: 'seller',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.amountRange) {
        const [start, end] = filter.amountRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            amount: {
              ...where.amount,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            amount: {
              ...where.amount,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.transaction_dateRange) {
        const [start, end] = filter.transaction_dateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            transaction_date: {
              ...where.transaction_date,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            transaction_date: {
              ...where.transaction_date,
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

      if (filter.buyer) {
        var listItems = filter.buyer.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          buyerId: { [Op.or]: listItems },
        };
      }

      if (filter.product) {
        var listItems = filter.product.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          productId: { [Op.or]: listItems },
        };
      }

      if (filter.seller) {
        var listItems = filter.seller.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          sellerId: { [Op.or]: listItems },
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
          count: await db.transactions.count({
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
      : await db.transactions.findAndCountAll({
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
          Utils.ilike('transactions', 'amount', query),
        ],
      };
    }

    const records = await db.transactions.findAll({
      attributes: ['id', 'amount'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['amount', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.amount,
    }));
  }
};

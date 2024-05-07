const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const devices = sequelize.define(
    'devices',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      title: {
        type: DataTypes.TEXT,
      },

      price: {
        type: DataTypes.DECIMAL,
      },

      description: {
        type: DataTypes.TEXT,
      },

      category: {
        type: DataTypes.ENUM,

        values: ['max_msp_externals', 'max_for_live_devices'],
      },

      is_free: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  devices.associate = (db) => {
    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    db.devices.hasMany(db.transactions, {
      as: 'transactions_product',
      foreignKey: {
        name: 'productId',
      },
      constraints: false,
    });

    //end loop

    db.devices.belongsTo(db.studios, {
      as: 'studio',
      foreignKey: {
        name: 'studioId',
      },
      constraints: false,
    });

    db.devices.hasMany(db.file, {
      as: 'images',
      foreignKey: 'belongsToId',
      constraints: false,
      scope: {
        belongsTo: db.devices.getTableName(),
        belongsToColumn: 'images',
      },
    });

    db.devices.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.devices.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return devices;
};

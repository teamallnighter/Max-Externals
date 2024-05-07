const db = require('../db/models');
const UsersDBApi = require('../db/api/users');
const processFile = require('../middlewares/upload');
const ValidationError = require('./notifications/errors/validation');
const csv = require('csv-parser');
const axios = require('axios');
const config = require('../config');
const stream = require('stream');

const InvitationEmail = require('./email/list/invitation');
const EmailSender = require('./email');
const AuthService = require('./auth');

module.exports = class UsersService {
  static async create(data, currentUser, sendInvitationEmails = true, host) {
    let transaction = await db.sequelize.transaction();

    let email = data.email;
    let emailsToInvite = [];
    try {
      if (email) {
        let user = await UsersDBApi.findBy({ email }, { transaction });
        if (user) {
          throw new ValidationError('iam.errors.userAlreadyExists');
        } else {
          await UsersDBApi.create(
            { data },

            {
              currentUser,
              transaction,
            },
          );
          emailsToInvite.push(email);
        }
      } else {
        throw new ValidationError('iam.errors.emailRequired');
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    if (emailsToInvite && emailsToInvite.length) {
      if (!sendInvitationEmails) return;

      AuthService.sendPasswordResetEmail(email, 'invitation', host);
    }
  }

  static async bulkImport(req, res, sendInvitationEmails = true, host) {
    const transaction = await db.sequelize.transaction();
    let emailsToInvite = [];

    try {
      await processFile(req, res);
      const bufferStream = new stream.PassThrough();
      const results = [];

      await bufferStream.end(Buffer.from(req.file.buffer, 'utf-8')); // convert Buffer to Stream

      await new Promise((resolve, reject) => {
        bufferStream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            console.log('results csv', results);
            resolve();
          })
          .on('error', (error) => reject(error));
      });

      const hasAllEmails = results.every((result) => result.email);

      if (!hasAllEmails) {
        throw new ValidationError('importer.errors.userEmailMissing');
      }

      await UsersDBApi.bulkImport(results, {
        transaction,
        ignoreDuplicates: true,
        validate: true,
        currentUser: req.currentUser,
      });

      emailsToInvite = results.map((result) => result.email);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    if (emailsToInvite && emailsToInvite.length && !sendInvitationEmails) {
      emailsToInvite.forEach((email) => {
        AuthService.sendPasswordResetEmail(email, 'invitation', host);
      });
    }
  }

  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      let users = await UsersDBApi.findBy({ id }, { transaction });

      if (!users) {
        throw new ValidationError('iam.errors.userNotFound');
      }

      await UsersDBApi.update(
        id,
        data,

        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return users;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (currentUser.id === id) {
        throw new ValidationError('iam.errors.deletingHimself');
      }

      if (currentUser.app_role?.name !== config.roles.admin) {
        throw new ValidationError('errors.forbidden.message');
      }

      await UsersDBApi.remove(id, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

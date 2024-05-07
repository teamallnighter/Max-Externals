const ValidationError = require('../services/notifications/errors/validation');

/**
 * @param {string} permission
 * @return {import("express").RequestHandler}
 */
function checkPermissions(permission) {
  return (req, res, next) => {
    const { currentUser } = req;
    if (currentUser) {
      if (currentUser.id === req.params.id || currentUser.id === req.body.id) {
        next();
        return;
      }
      const userPermission = currentUser.custom_permissions.find(
        (cp) => cp.name === permission,
      );

      if (userPermission) {
        next();
      } else {
        if (!currentUser.app_role) {
          return next(new ValidationError('auth.forbidden'));
        }
        currentUser.app_role
          .getPermissions()
          .then((permissions) => {
            if (permissions.find((p) => p.name === permission)) {
              next();
            } else {
              next(new ValidationError('auth.forbidden'));
            }
          })
          .catch((e) => next(e));
      }
    } else {
      next(new ValidationError('auth.unauthorized'));
    }
  };
}

const METHOD_MAP = {
  POST: 'CREATE',
  GET: 'READ',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

/**
 * @param {string} name
 * @return {import("express").RequestHandler}
 */
function checkCrudPermissions(name) {
  return (req, res, next) => {
    const permissionName = `${METHOD_MAP[req.method]}_${name.toUpperCase()}`;
    checkPermissions(permissionName)(req, res, next);
  };
}

module.exports = {
  checkPermissions,
  checkCrudPermissions,
};

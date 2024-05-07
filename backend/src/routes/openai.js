const express = require('express');
const db = require('../db/models');
const wrapAsync = require('../helpers').wrapAsync;
const router = express.Router();
const sjs = require('sequelize-json-schema');
const { getWidget } = require('../services/openai');
const RolesService = require('../services/roles');

/**
 * @swagger
 * /api/roles/roles-info/{infoId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Remove role information by ID
 *     description: Remove specific role information by ID
 *     parameters:
 *       - in: path
 *         name: infoId
 *         description: ID of role information to remove
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         description: ID of the user
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: key
 *         description: Key of the role information to remove
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role information successfully removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   description: The user information
 *       400:
 *         description: Invalid ID or key supplied
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         description: Role not found
 *       500:
 *         description: Some server error
 */

router.delete(
  '/roles-info/:infoId',
  wrapAsync(async (req, res) => {
    const role = await RolesService.removeRoleInfoById(
      req.query.infoId,
      req.query.roleId,
      req.query.key,
      req.currentUser,
    );

    res.status(200).send(role);
  }),
);

/**
 * @swagger
 * /api/roles/role-info/{roleId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Roles]
 *     summary: Get role information by key
 *     description: Get specific role information by key
 *     parameters:
 *       - in: path
 *         name: roleId
 *         description: ID of role to get information for
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: key
 *         description: Key of the role information to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role information successfully received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 info:
 *                   type: string
 *                   description: The role information
 *       400:
 *         description: Invalid ID or key supplied
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         description: Role not found
 *       500:
 *         description: Some server error
 */

router.get(
  '/info-by-key',
  wrapAsync(async (req, res) => {
    const info = await RolesService.getRoleInfoByKey(
      req.query.key,
      req.query.roleId,
      req.currentUser,
    );
    res.status(200).send(info);
  }),
);

router.post(
  '/create_widget',
  wrapAsync(async (req, res) => {
    const { description, userId, roleId } = req.body;

    const currentUser = req.currentUser;
    const schema = await sjs.getSequelizeSchema(db.sequelize, {});
    const payload = {
      description,
      modelDefinition: schema.definitions,
    };

    const widgetId = await getWidget(payload, userId, roleId);

    if (widgetId) {
      await RolesService.addRoleInfo(
        roleId,
        userId,
        'widgets',
        widgetId,
        currentUser,
      );

      return res.status(200).send(widgetId);
    } else {
      return res.status(400).send(widgetId);
    }
  }),
);

module.exports = router;

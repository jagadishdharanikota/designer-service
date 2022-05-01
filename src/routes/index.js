const express = require('express');
const componentPropertiesRoutes = require('./component-properties-routes');
const classDefinitionRoutes = require('./classdefinition-routes');
const portalRoutes = require('./portal-routes');
const pageRoutes = require('./page-routes');
const routesMetadata = require('./routesmetadata-routes');
const saveAsRoutes = require('./saveas-routes');
const snapshotRoutes = require('./snapshot-routes');
const viewRoutes = require('./view-routes');

const router = express.Router();

module.exports = () => {
  router.use('/', componentPropertiesRoutes());
  router.use('/', classDefinitionRoutes());
  router.use('/', pageRoutes());
  router.use('/', portalRoutes());
  router.use('/', routesMetadata());
  router.use('/', saveAsRoutes());
  router.use('/', snapshotRoutes());
  router.use('/', viewRoutes());
  return router;
};

const express = require('express');
const router = express.Router();
const routesMetadata = require('./routes-metadata');

module.exports = () => {
  router.get('/routesmetadata', async (req, res) => {
    try {
      if (routesMetadata) {
        res.status(200).json(routesMetadata);
      } else {
        // Record not found with given id
        res.status(404).json({ message: 'Record not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  });

  return router;
};

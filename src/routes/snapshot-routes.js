const express = require('express');
const DBManager = require('../shared/db-manager');
const { MONGO_COLLECTIONS } = require('../shared/constants');

const router = express.Router();

module.exports = () => {
  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  router.get('/snapshots/:_id', (req, res) => {
    DBManager.find(MONGO_COLLECTIONS.DATASNAPSHOTS, { _id: req.params._id })
      .then((data) => {
        if (data) {
          const itemName = capitalize(req.params._id);
          const [response] = data;
          response._id = `New${itemName}`;
          response.name = `New ${itemName}`;
          response.description = `Creates new ${req.params._id}`;
          res.status(200).json(response);
        } else {
          // Record not found with given id
          res.status(404).json({ message: 'Record not found' });
        }
      })
      .catch((message) => res.status(500).json(message));
  });

  router.post('/snapshots', (req, res) => {
    DBManager.insert(MONGO_COLLECTIONS.DATASNAPSHOTS, req.body)
      .then((data) => res.status(200).json(data))
      .catch((message) => res.status(500).json(message));
  });

  return router;
};

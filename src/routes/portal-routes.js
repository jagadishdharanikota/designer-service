const express = require('express');
const DBManager = require('../shared/db-manager');

const router = express.Router();

module.exports = () => {
  router.get('/portals/:_id', (req, res) => {
    DBManager.find('portals', { _id: req.params._id })
      .then((data) => {
        if (data) {
          res.status(200).json(data[0]);
        } else {
          // Record not found with given id
          res.status(404).json({ message: 'Record not found' });
        }
      })
      .catch((message) => res.status(500).json(message));
  });

  router.get('/portals', (req, res) => {
    DBManager.insert('portals', req.body)
      .then((data) => res.status(200).json(data))
      .catch((message) => res.status(500).json(message));
  });

  router.post('/portals', (req, res) => {
    DBManager.insert('portals', req.body)
      .then((data) => res.status(200).json(data))
      .catch((message) => res.status(500).json(message));
  });

  router.put('/portals/:_id', (req, res) => {
    DBManager.replace('portals', { _id: req.params._id }, req.body)
      .then((data) => res.status(200).json(data))
      .catch((message) => res.status(500).json(message));
  });

  return router;
};

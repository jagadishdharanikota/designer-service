const express = require('express');
const DBManager = require('../shared/db-manager');

const router = express.Router();

module.exports = () => {
  router.get('/pages/:_id', async (req, res) => {
    const [metadata] = await DBManager.find('pages', { _id: req.params._id });

    if (metadata) {
      const { dataSource } = metadata;
      const data = {};

      /* eslint-disable no-await-in-loop */
      if (dataSource && dataSource.length > 0) {
        for (let index = 0; index < dataSource.length; index += 1) {
          const item = dataSource[index];
          const [responseData] = await DBManager.find(item.name, { _id: item.key });
          data[item.key] = responseData;
        }
      }

      const response = {
        metadata,
        data,
      };
      res.status(200).json(response);
    } else {
      // Record not found with given id
      res.status(404).json({ message: 'Record not found' });
    }
  });

  router.post('/pages', (req, res) => {
    DBManager.insert('pages', req.body)
      .then((data) => res.status(200).json(data))
      .catch((message) => res.status(500).json(message));
  });

  router.put('/pages/:_id', (req, res) => {
    DBManager.update('pages', { _id: req.params._id }, req.body)
      .then((data) => res.status(200).json(data))
      .catch((message) => res.status(500).json(message));
  });

  return router;
};

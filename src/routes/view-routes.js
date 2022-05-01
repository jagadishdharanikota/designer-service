const express = require('express');
const DBManager = require('../shared/db-manager');
const getClassProperties = require('../shared/class-manager');

const router = express.Router();

module.exports = () => {
  router.get('/views/:_id', async (req, res) => {
    try {
      const [metadata] = await DBManager.find('views', { _id: req.params._id });
      if (metadata) {
        const { dataSource } = metadata;
        const data = {};

        /* eslint-disable no-await-in-loop */
        if (dataSource && dataSource.length > 0) {
          for (let index = 0; index < dataSource.length; index += 1) {
            const item = dataSource[index];
            if (item && item.key && item.name) {
              const [responseData] = await DBManager.find(item.name, { _id: item.key });
              data[item.key] = responseData;
            }
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
    } catch (error) {
      res.status(500).json(error);
    }
  });

  router.get('/views/create/definition', async (req, res) => {
    try {
      const data = await getClassProperties('Component-Configuration-View');
      if (data) {
        res.status(200).json(data);
      } else {
        // Record not found with given id
        res.status(404).json({ message: 'Record not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  });

  // Get all the views. Accests query parameters to return required properties of document
  // Eg: http://localhost:8000/views?fields=_id,type,category
  router.get('/views', async (req, res) => {
    // Building projection object to retrieve the required properties from the document
    const projection = {};
    if (Object.prototype.hasOwnProperty.call(req.query, 'fields')) {
      const fieldList = req.query.fields.split(',');
      fieldList.forEach((field) => {
        projection[field] = 1;
      });
    }

    try {
      const data = await DBManager.find('views', {}, { projection });
      if (data) {
        res.status(200).json(data);
      } else {
        // Record not found with given id
        res.status(404).json({ message: 'Record not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  });

  router.post('/views', (req, res) => {
    // ToDo:
    // 201 Created
    // 401 Unauthorized
    // 409 Conflict
    // 404 Not found

    DBManager.insert('views', req.body)
      .then((data) => res.status(201).json(data))
      .catch((message) => res.status(500).json(message));
  });

  router.put('/views/:_id', (req, res) => {
    DBManager.update('views', { _id: req.params._id }, req.body)
      .then((data) => res.status(200).json(data))
      .catch((message) => res.status(500).json(message));
  });

  router.all('/views/*', (req, res) => {
    res.status(405);
  });

  return router;
};

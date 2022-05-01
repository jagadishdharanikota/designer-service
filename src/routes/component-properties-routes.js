const express = require('express');
const DBManager = require('../shared/db-manager');
const getClassProperties = require('../shared/class-manager');

const router = express.Router();

module.exports = () => {
  /**
   *
   */
  router.get('/componentproperties/:_id', async (req, res) => {
    try {
      const [data] = await DBManager.find('classDefinitions', { _id: req.params._id });
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

  router.get('/componentproperties/:_id/properties', async (req, res) => {
    const component = req.params._id;
    let className;
    let category = 'control';
    switch (component) {
      case 'Autocomplete':
        className = 'Component-Configuration-Autocomplete';
        break;
      case 'Input':
        className = 'Component-Configuration-Input';
        break;
      case 'TextArea':
        className = 'Component-Configuration-Input';
        break;
      case 'Dropdown':
        className = 'Component-Configuration-Dropdown';
        break;
      case 'RadioButton':
        className = 'Component-Configuration-RadioButton';
        break;
      case 'Checkbox':
        className = 'Component-Configuration-Checkbox';
        break;
      case 'View':
        className = 'Component-Configuration-View';
        category = 'layout';
        break;
      default:
        console.info('No matching control found');
    }

    try {
      const responseData = await getClassProperties(className);
      const { properties } = responseData;

      properties.component = component;
      properties.category = category;
      properties.key = Date.now().toString();
      properties.config.label = component;

      res.status(200).json(properties);
    } catch (error) {
      res.status(500).json(error);
    }
  });

  /**
   * Get all the classDefinitions. Pass query parameters to return required properties of document
   *
   * Usage: http://localhost:8000/views?fields=_id,type,category
   */
  router.get('/componentproperties', async (req, res) => {
    // Building projection object to retrieve the required properties from the document
    const projection = {};
    if (Object.prototype.hasOwnProperty.call(req.query, 'fields')) {
      const fieldList = req.query.fields.split(',');
      fieldList.forEach((field) => {
        projection[field] = 1;
      });
    }

    try {
      const data = await DBManager.find('classDefinitions', {}, { projection });
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

  router.post('/componentproperties', (req, res) => {
    // ToDo:
    // 201 Created
    // 401 Unauthorized
    // 409 Conflict
    // 404 Not found

    DBManager.insert('classDefinitions', req.body)
      .then((data) => res.status(201).json(data))
      .catch((message) => res.status(500).json(message));
  });

  router.put('/componentproperties/:_id', (req, res) => {
    DBManager.update('classDefinitions', { _id: req.params._id }, req.body)
      .then((data) => res.status(200).json(data))
      .catch((message) => res.status(500).json(message));
  });

  router.all('/componentproperties/*', (req, res) => {
    res.status(405);
  });

  return router;
};

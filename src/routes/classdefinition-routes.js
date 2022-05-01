const express = require('express');
const DBManager = require('../shared/db-manager');
const getClassProperties = require('../shared/class-manager');

const router = express.Router();

module.exports = () => {
  router.get('/classdefinition/:_id', async (req, res) => {
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

  router.get('/classdefinition/:_id/properties', async (req, res) => {
    let className;
    switch (req.params._id) {
      case 'Input':
      case 'TextArea':
        className = 'Component-Configuration-Input';
        break;
      case 'View':
        className = 'Component-Configuration-View';
        break;
      default:
        console.info('No matching control found');
    }

    try {
      const responseData = await getClassProperties(className);
      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json(error);
    }
  });

  /* Get all the classDefinitions. Pass query parameters to return required properties of document

  Usage: http://localhost:8000/views?fields=_id,type,category
  */
  router.get('/classdefinitions', async (req, res) => {
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

  router.post('/classdefinitions', (req, res) => {
    // ToDo:
    // 201 Created
    // 401 Unauthorized
    // 409 Conflict
    // 404 Not found

    DBManager.insert('classDefinitions', req.body)
      .then((data) => res.status(201).json(data))
      .catch((message) => res.status(500).json(message));
  });

  router.put('/classdefinitions/:_id', (req, res) => {
    DBManager.update('classDefinitions', { _id: req.params._id }, req.body)
      .then((data) => res.status(200).json(data))
      .catch((message) => res.status(500).json(message));
  });

  router.all('/classdefinitions/*', (req, res) => {
    res.status(405);
  });

  return router;
};

/*
const query = [
  {
    $match: { _id: { $in: [className] } },
  },
];
const [data] = await DBManager.aggregate('classDefinitions', query);

db.classDefinitions.aggregate([
  {
    $match: { _id: 'Component-Configuration-Input' },
  },
  {
    $lookup: {
      from: 'classDefinitions',
      localField: 'parentClassName',
      foreignField: '_id',
      as: 'parentProperties',
    },
  },
  {
    $unwind: '$parentProperties',
  },
  {
    $addFields: {
      properties: {
        $filter: {
          input: {
            $concatArrays: ['$parentProperties.properties', '$properties'],
          },
          as: 'propertyObject',
          cond: {
            $ne: ['$$propertyObject.objectClass', '<Dynamic>'],
          },
        },
      },
    },
  },
  {
    $project: {
      _id: 1,
      className: 1,
      description: 1,
      properties: {
        $map: {
          input: '$properties',
          as: 'property',
          in: '$$property.propertyName',
        },
      },
    },
  },
]);

const query = [
  {
    $match: { _id: classDefinitionId },
  },
  {
    $lookup: {
      from: 'classDefinitions',
      localField: 'parentClassName',
      foreignField: '_id',
      as: 'parentProperties',
    },
  },
  {
    $unwind: '$parentProperties',
  },
  {
    $addFields: {
      properties: {
        $filter: {
          input: {
            $concatArrays: ['$parentProperties.properties', '$properties'],
          },
          as: 'propertyObject',
          cond: {
            $ne: ['$$propertyObject.objectClass', '<Dynamic>'],
          },
        },
      },
    },
  },
  {
    $project: {
      _id: 1,
      className: 1,
      description: 1,
      properties: {
        $map: {
          input: '$properties',
          as: 'property',
          in: '$$property.propertyName',
        },
      },
    },
  },
];
*/

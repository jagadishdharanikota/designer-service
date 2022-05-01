const express = require('express');
const DBManager = require('../shared/db-manager');

const router = express.Router();

module.exports = () => {
  router.get('/saveas/:_id', async (req, res) => {
    try {
      const { _id } = req.params;
      const { from, to } = req.query;
      const count = await DBManager.recordCount('views', { _id: to });
      const [metadata] = await DBManager.find('views', { _id: from });

      if (count === 0 && metadata) {
        const response = await DBManager.insert('views', { ...metadata, _id: to });
        res.status(200).json(response.ops);
      } else if (count > 0) {
        res.status(409).json({ message: 'Resource already exist' });
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

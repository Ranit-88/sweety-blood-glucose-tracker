const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  addReading,
  getReadings,
  getReading,
  updateReading,
  deleteReading
} = require('../controllers/readingController');

// All reading routes need authentication
router.use(authMiddleware);

router.post('/', addReading);
router.get('/', getReadings);
router.get('/:id', getReading);
router.put('/:id', updateReading);
router.delete('/:id', deleteReading);

module.exports = router;

const pool = require('../config/db');

// Allowed time slots
const ALLOWED_SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner'
];

// Helper to get today's date in YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Add a new reading
const addReading = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, slot, value } = req.body;

    // Validate required fields
    if (!date) {
      return res.status(400).json({ message: 'Please select a date.' });
    }
    if (!slot) {
      return res.status(400).json({ message: 'Please select a time slot.' });
    }
    if (value === undefined || value === null || value === '') {
      return res.status(400).json({ message: 'Please enter a glucose value.' });
    }

    // Validate slot
    if (!ALLOWED_SLOTS.includes(slot)) {
      return res.status(400).json({ message: 'Invalid time slot selected.' });
    }

    // Validate value is a whole number between 40 and 600
    const numValue = Number(value);
    if (!Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
      return res.status(400).json({ message: 'Value must be between 40 and 600 mg/dl.' });
    }

    // Validate date is not in the future
    const today = getTodayDate();
    if (date > today) {
      return res.status(400).json({ message: 'Date cannot be in the future.' });
    }

    // Check how many readings already exist for this date
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM readings WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    const readingCount = parseInt(countResult.rows[0].count);

    if (readingCount >= 4) {
      return res.status(400).json({ message: 'You can add only 4 readings per day.' });
    }

    // Check if this slot already exists for this date
    const existing = await pool.query(
      'SELECT id FROM readings WHERE user_id = $1 AND date = $2 AND slot = $3',
      [userId, date, slot]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: `You already have an ${slot} reading for this date.` });
    }

    // Insert the reading
    const result = await pool.query(
      `INSERT INTO readings (user_id, date, slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING id, date, slot, value, created_at`,
      [userId, date, slot, numValue]
    );

    res.status(201).json({
      message: 'Reading added successfully!',
      reading: result.rows[0]
    });
  } catch (error) {
    console.error('Add reading error:', error);
    // Handle unique constraint violation just in case
    if (error.code === '23505') {
      return res.status(400).json({ message: 'You already have a reading for this slot on this date.' });
    }
    res.status(500).json({ message: 'Server error while adding reading.' });
  }
};

// Get all readings for the logged-in user
const getReadings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, date, slot, value, created_at
       FROM readings
       WHERE user_id = $1
       ORDER BY date DESC, 
         CASE slot
           WHEN 'Morning (fasting)' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
         END`,
      [userId]
    );

    res.json({ readings: result.rows });
  } catch (error) {
    console.error('Get readings error:', error);
    res.status(500).json({ message: 'Server error while fetching readings.' });
  }
};

// Get a single reading by id
const getReading = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, date, slot, value, created_at FROM readings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found.' });
    }

    res.json({ reading: result.rows[0] });
  } catch (error) {
    console.error('Get reading error:', error);
    res.status(500).json({ message: 'Server error while fetching reading.' });
  }
};

// Update a reading
const updateReading = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { date, slot, value } = req.body;

    // First check if the reading exists and belongs to the user
    const existing = await pool.query(
      'SELECT * FROM readings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found.' });
    }

    const oldReading = existing.rows[0];

    // Use old values if new ones are not provided
    const newDate = date || oldReading.date;
    const newSlot = slot || oldReading.slot;
    const newValue = value !== undefined && value !== null && value !== '' ? value : oldReading.value;

    // Validate slot
    if (!ALLOWED_SLOTS.includes(newSlot)) {
      return res.status(400).json({ message: 'Invalid time slot selected.' });
    }

    // Validate value
    const numValue = Number(newValue);
    if (!Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
      return res.status(400).json({ message: 'Value must be between 40 and 600 mg/dl.' });
    }

    // Validate date is not in the future
    const today = getTodayDate();
    if (newDate > today) {
      return res.status(400).json({ message: 'Date cannot be in the future.' });
    }

    // Check for duplicate slot (exclude the current reading)
    const duplicate = await pool.query(
      `SELECT id FROM readings 
       WHERE user_id = $1 AND date = $2 AND slot = $3 AND id != $4`,
      [userId, newDate, newSlot, id]
    );

    if (duplicate.rows.length > 0) {
      return res.status(400).json({ message: `You already have an ${newSlot} reading for this date.` });
    }

    // If the date is changing, check the daily limit on the new date
    if (newDate !== oldReading.date) {
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM readings WHERE user_id = $1 AND date = $2',
        [userId, newDate]
      );
      const readingCount = parseInt(countResult.rows[0].count);

      if (readingCount >= 4) {
        return res.status(400).json({ message: 'You can add only 4 readings per day.' });
      }
    }

    // Update the reading
    const result = await pool.query(
      `UPDATE readings 
       SET date = $1, slot = $2, value = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, date, slot, value, created_at`,
      [newDate, newSlot, numValue, id, userId]
    );

    res.json({
      message: 'Reading updated successfully!',
      reading: result.rows[0]
    });
  } catch (error) {
    console.error('Update reading error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'You already have a reading for this slot on this date.' });
    }
    res.status(500).json({ message: 'Server error while updating reading.' });
  }
};

// Delete a reading
const deleteReading = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reading not found.' });
    }

    res.json({ message: 'Reading deleted successfully!' });
  } catch (error) {
    console.error('Delete reading error:', error);
    res.status(500).json({ message: 'Server error while deleting reading.' });
  }
};

module.exports = {
  addReading,
  getReadings,
  getReading,
  updateReading,
  deleteReading
};

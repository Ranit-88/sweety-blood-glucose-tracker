const pool = require('../config/db');

// Helper to calculate stats from readings
const calculateStats = (readings) => {
  if (!readings || readings.length === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      total: 0
    };
  }

  const values = readings.map(r => r.value);
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const average = Math.round((sum / values.length) * 10) / 10; // one decimal place
  const total = values.length;

  return { highest, lowest, average, total };
};

// Daily Report
const getDailyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Please provide a date (YYYY-MM-DD).' });
    }

    // Validate date format roughly
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const result = await pool.query(
      `SELECT id, date, slot, value, created_at
       FROM readings
       WHERE user_id = $1 AND date = $2
       ORDER BY 
         CASE slot
           WHEN 'Morning (fasting)' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
           ELSE 5
         END`,
      [userId, date]
    );

    const readings = result.rows;
    const stats = calculateStats(readings);

    if (readings.length === 0) {
      return res.json({
        message: 'No readings available for this period.',
        period: date,
        stats,
        readings: []
      });
    }

    res.json({
      period: date,
      stats,
      readings
    });
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({ message: 'Server error while generating daily report.' });
  }
};

// Month-to-Date Report
const getMonthToDateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Please provide a date (YYYY-MM-DD).' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // First day of the month of the given date
    const startDate = date.substring(0, 8) + '01';

    const result = await pool.query(
      `SELECT id, date, slot, value, created_at
       FROM readings
       WHERE user_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date ASC,
         CASE slot
           WHEN 'Morning (fasting)' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
           ELSE 5
         END`,
      [userId, startDate, date]
    );

    const readings = result.rows;
    const stats = calculateStats(readings);

    if (readings.length === 0) {
      return res.json({
        message: 'No readings available for this period.',
        period: `${startDate} to ${date}`,
        stats,
        readings: []
      });
    }

    res.json({
      period: `${startDate} to ${date}`,
      stats,
      readings
    });
  } catch (error) {
    console.error('Month-to-date report error:', error);
    res.status(500).json({ message: 'Server error while generating month-to-date report.' });
  }
};

// Monthly Report (previous full calendar month based on selected date)
const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Please provide a date (YYYY-MM-DD).' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Calculate previous month
    const selected = new Date(date + 'T00:00:00');
    const year = selected.getFullYear();
    const month = selected.getMonth(); // 0-based

    // Previous month
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear = year - 1;
    }

    // Start and end of previous month
    const startDate = new Date(prevYear, prevMonth, 1);
    const endDate = new Date(prevYear, prevMonth + 1, 0); // last day of prev month

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT id, date, slot, value, created_at
       FROM readings
       WHERE user_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date ASC,
         CASE slot
           WHEN 'Morning (fasting)' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
           ELSE 5
         END`,
      [userId, startStr, endStr]
    );

    const readings = result.rows;
    const stats = calculateStats(readings);

    if (readings.length === 0) {
      return res.json({
        message: 'No readings available for this period.',
        period: `${startStr} to ${endStr}`,
        stats,
        readings: []
      });
    }

    res.json({
      period: `${startStr} to ${endStr}`,
      stats,
      readings
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ message: 'Server error while generating monthly report.' });
  }
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport
};

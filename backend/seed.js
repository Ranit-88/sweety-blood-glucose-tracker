const bcrypt = require('bcryptjs');
const pool = require('./config/db');
require('dotenv').config();

async function seed() {
  try {
    console.log('Starting seed...');

    // Demo user details
    const name = 'Demo User';
    const email = 'demo@sweety.com';
    const password = 'Sweety@123';

    // Check if demo user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    let userId;

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      console.log('Demo user already exists. Using existing user (id:', userId + ')');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert demo user
      const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [name, email, hashedPassword]
      );

      userId = result.rows[0].id;
      console.log('Demo user created successfully (id:', userId + ')');
    }

    // Sample readings - different dates and all 4 slots
    const sampleReadings = [
      // 10 Nov 2026 - full day
      { date: '2026-11-10', slot: 'Morning (fasting)', value: 98 },
      { date: '2026-11-10', slot: 'After breakfast', value: 145 },
      { date: '2026-11-10', slot: 'After lunch', value: 132 },
      { date: '2026-11-10', slot: 'After dinner', value: 118 },

      // 11 Nov 2026
      { date: '2026-11-11', slot: 'Morning (fasting)', value: 105 },
      { date: '2026-11-11', slot: 'After breakfast', value: 158 },
      { date: '2026-11-11', slot: 'After lunch', value: 140 },

      // 12 Nov 2026
      { date: '2026-11-12', slot: 'Morning (fasting)', value: 92 },
      { date: '2026-11-12', slot: 'After breakfast', value: 138 },
      { date: '2026-11-12', slot: 'After dinner', value: 125 },

      // 13 Nov 2026 - full day
      { date: '2026-11-13', slot: 'Morning (fasting)', value: 110 },
      { date: '2026-11-13', slot: 'After breakfast', value: 162 },
      { date: '2026-11-13', slot: 'After lunch', value: 148 },
      { date: '2026-11-13', slot: 'After dinner', value: 135 },

      // 14 Nov 2026
      { date: '2026-11-14', slot: 'Morning (fasting)', value: 101 },
      { date: '2026-11-14', slot: 'After lunch', value: 129 },

      // 15 Nov 2026
      { date: '2026-11-15', slot: 'Morning (fasting)', value: 95 },
      { date: '2026-11-15', slot: 'After breakfast', value: 142 },
      { date: '2026-11-15', slot: 'After dinner', value: 121 },

      // 16 Nov 2026
      { date: '2026-11-16', slot: 'Morning (fasting)', value: 108 },
      { date: '2026-11-16', slot: 'After breakfast', value: 155 },
      { date: '2026-11-16', slot: 'After lunch', value: 137 },
      { date: '2026-11-16', slot: 'After dinner', value: 128 }
    ];

    let insertedCount = 0;
    let skippedCount = 0;

    for (const reading of sampleReadings) {
      // Check if this reading already exists (avoid duplicates)
      const existing = await pool.query(
        'SELECT id FROM readings WHERE user_id = $1 AND date = $2 AND slot = $3',
        [userId, reading.date, reading.slot]
      );

      if (existing.rows.length > 0) {
        skippedCount++;
        continue;
      }

      await pool.query(
        'INSERT INTO readings (user_id, date, slot, value) VALUES ($1, $2, $3, $4)',
        [userId, reading.date, reading.slot, reading.value]
      );
      insertedCount++;
    }

    console.log(`Sample insert: ${insertedCount}`);
    console.log(`: ${skippedCount}`);
    console.log('');
    console.log('Demo Account');
    console.log('Name     : Demo User');
    console.log('Email    : demo@sweety.com');
    console.log('Password : Sweety@123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seed();
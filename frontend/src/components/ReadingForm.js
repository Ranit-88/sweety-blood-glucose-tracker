import React, { useState, useEffect } from 'react';

const SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner'
];

function ReadingForm({ onSubmit, editingReading, onCancel }) {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  // Get today's date in YYYY-MM-DD
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (editingReading) {
      // Format date 
      const d = editingReading.date;
      setDate(typeof d === 'string' ? d.split('T')[0] : d);
      setSlot(editingReading.slot);
      setValue(editingReading.value);
    } else {
      setDate(getToday());
      setSlot('');
      setValue('');
    }
    setError('');
  }, [editingReading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !slot || value === '') {
      setError('Please fill in all fields.');
      return;
    }

    const numValue = Number(value);
    if (!Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
      setError('Value must be between 40 and 600 mg/dl.');
      return;
    }

    try {
      await onSubmit({ date, slot, value: numValue });
      if (!editingReading) {
        setSlot('');
        setValue('');
        setDate(getToday());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="reading-form-card">
      <h3>{editingReading ? 'Edit Reading' : 'Add New Reading'}</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={getToday()}
            required
          />
        </div>
        <div className="form-group">
          <label>Time Slot</label>
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            required
          >
            <option value="">Select slot</option>
            {SLOTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Glucose Value (mg/dl)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 110"
            min="40"
            max="600"
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingReading ? 'Update' : 'Add Reading'}
          </button>
          {editingReading && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReadingForm;

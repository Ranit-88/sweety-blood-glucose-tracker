import React from 'react';

function ReadingList({ readings, onEdit, onDelete }) {
  if (!readings || readings.length === 0) {
    return (
      <div className="empty-state">
        <p>No readings yet. Add your first reading above!</p>
      </div>
    );
  }

  // Sort by date descending, then by slot order
  const slotOrder = {
    'Morning (fasting)': 1,
    'After breakfast': 2,
    'After lunch': 3,
    'After dinner': 4
  };

  const sorted = [...readings].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date > a.date ? 1 : -1;
    }
    return (slotOrder[a.slot] || 5) - (slotOrder[b.slot] || 5);
  });

  const formatDate = (d) => {
    if (!d) return '';
    const str = typeof d === 'string' ? d.split('T')[0] : d;
    const parts = str.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="reading-list">
      <h3>Your Readings</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Slot</th>
              <th>Value (mg/dl)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((reading) => (
              <tr key={reading.id}>
                <td>{formatDate(reading.date)}</td>
                <td>{reading.slot}</td>
                <td className="value-cell">{reading.value}</td>
                <td className="actions-cell">
                  <button
                    className="btn-edit"
                    onClick={() => onEdit(reading)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(reading.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReadingList;

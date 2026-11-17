import React from 'react';

function ReportCard({ title, period, stats, readings, message }) {
  if (message && (!readings || readings.length === 0)) {
    return (
      <div className="report-card">
        <h3>{title}</h3>
        <p className="period">{period}</p>
        <p className="no-data">{message}</p>
      </div>
    );
  }

  return (
    <div className="report-card">
      <h3>{title}</h3>
      <p className="period">{period}</p>
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Highest</span>
          <span className="stat-value">{stats.highest ?? '-'}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Lowest</span>
          <span className="stat-value">{stats.lowest ?? '-'}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Average</span>
          <span className="stat-value">{stats.average ?? '-'}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.total ?? 0}</span>
        </div>
      </div>
      {readings && readings.length > 0 && (
        <div className="report-readings">
          <h4>Readings</h4>
          <ul>
            {readings.map((r) => (
              <li key={r.id}>
                {typeof r.date === 'string' ? r.date.split('T')[0] : r.date} – {r.slot}: <strong>{r.value}</strong> mg/dl
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ReportCard;
